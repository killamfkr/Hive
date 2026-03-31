import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getServerEnv, stripeConfigured, xuiConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { xuiCreateLine, xuiRenewLine } from "@/lib/xui";
import crypto from "crypto";

function randomCreds() {
  const user = `u_${crypto.randomBytes(4).toString("hex")}`;
  const pass = crypto.randomBytes(10).toString("base64url");
  return { user, pass };
}

async function provisionPaidUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.membershipTier !== "PAID") return;
  if (!xuiConfigured(getServerEnv())) return;
  if (user.xuiLineId) return;
  const { user: xu, pass: xp } = randomCreds();
  try {
    const { lineId } = await xuiCreateLine(xu, xp);
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 1);
    await prisma.user.update({
      where: { id: userId },
      data: {
        xuiLineId: lineId,
        xuiUsername: xu,
        xuiPassword: xp,
        xuiExpiresAt: exp,
      },
    });
  } catch (e) {
    console.error("XUI provision failed for user", userId, e);
  }
}

function subscriptionIdFromSession(session: Stripe.Checkout.Session): string | null {
  const sub = session.subscription;
  if (typeof sub === "string") return sub;
  if (sub && typeof sub === "object" && "id" in sub && typeof (sub as { id: unknown }).id === "string") {
    return (sub as { id: string }).id;
  }
  return null;
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ?? session.client_reference_id;
  if (!userId || typeof userId !== "string") return;
  const subId = subscriptionIdFromSession(session);
  const customerId = typeof session.customer === "string" ? session.customer : null;
  await prisma.user.update({
    where: { id: userId },
    data: {
      membershipTier: "PAID",
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subId ?? undefined,
      stripeSubscriptionStatus: "active",
    },
  });
  await provisionPaidUser(userId);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  const active = sub.status === "active" || sub.status === "trialing";
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        stripeSubscriptionId: sub.id,
        stripeSubscriptionStatus: sub.status,
        membershipTier: active ? "PAID" : "FREE",
      },
    });
    return;
  }
  await prisma.user.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      stripeSubscriptionStatus: sub.status,
      membershipTier: active ? "PAID" : "FREE",
    },
  });
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId;
  if (userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        membershipTier: "FREE",
        stripeSubscriptionStatus: "canceled",
      },
    });
    return;
  }
  await prisma.user.updateMany({
    where: { stripeSubscriptionId: sub.id },
    data: {
      membershipTier: "FREE",
      stripeSubscriptionStatus: "canceled",
    },
  });
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent;
  if (
    parent?.type === "subscription_details" &&
    parent.subscription_details?.subscription
  ) {
    const sub = parent.subscription_details.subscription;
    return typeof sub === "string" ? sub : sub.id;
  }
  return null;
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subId = subscriptionIdFromInvoice(invoice);
  if (!subId) return;
  if (invoice.billing_reason !== "subscription_cycle") return;
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subId },
  });
  if (!user?.xuiLineId) return;
  if (!xuiConfigured(getServerEnv())) return;
  try {
    await xuiRenewLine(user.xuiLineId);
    const exp = new Date();
    exp.setMonth(exp.getMonth() + 1);
    await prisma.user.update({
      where: { id: user.id },
      data: { xuiExpiresAt: exp },
    });
  } catch (e) {
    console.error("XUI renew failed", user.id, e);
  }
}

export async function POST(req: Request) {
  const env = getServerEnv();
  if (!stripeConfigured(env) || !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const existing = await prisma.processedStripeEvent.findUnique({
    where: { id: event.id },
  });
  if (existing) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode === "subscription") await handleCheckoutCompleted(s);
        break;
      }
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
    await prisma.processedStripeEvent.create({ data: { id: event.id } });
  } catch (e) {
    console.error("Webhook handler error", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

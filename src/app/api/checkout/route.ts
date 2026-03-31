import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServerEnv, stripeConfigured } from "@/lib/env";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const env = getServerEnv();
  if (!stripeConfigured(env)) {
    return NextResponse.json({ error: "Billing not configured" }, { status: 503 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const stripe = getStripe();
  let base = "http://localhost:3000";
  if (env.NEXTAUTH_URL) base = env.NEXTAUTH_URL.replace(/\/$/, "");
  else if (process.env.VERCEL_URL) base = `https://${process.env.VERCEL_URL}`;

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.stripeCustomerId ? undefined : user.email,
    customer: user.stripeCustomerId ?? undefined,
    line_items: [{ price: env.STRIPE_PRICE_ID_PAID!, quantity: 1 }],
    success_url: `${base}/account?checkout=success`,
    cancel_url: `${base}/membership?checkout=cancel`,
    client_reference_id: user.id,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id },
    },
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "No checkout URL" }, { status: 500 });
  }
  return NextResponse.json({ url: checkout.url });
}

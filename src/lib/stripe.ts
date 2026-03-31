import Stripe from "stripe";
import { getServerEnv, stripeConfigured } from "@/lib/env";

export function getStripe(): Stripe {
  const env = getServerEnv();
  if (!stripeConfigured(env) || !env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
}

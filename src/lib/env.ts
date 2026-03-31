import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_ID_PAID: z.string().optional(),
  XUI_BASE_URL: z.string().url().optional(),
  XUI_API_KEY: z.string().optional(),
  XUI_BOUQUET_IDS: z.string().optional(),
  XUI_MAX_CONNECTIONS: z.string().optional(),
  XUI_SUBSCRIPTION_LENGTH: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function getServerEnv(): ServerEnv {
  return serverSchema.parse(process.env);
}

export function stripeConfigured(env: ServerEnv): boolean {
  return Boolean(
    env.STRIPE_SECRET_KEY &&
      env.STRIPE_PRICE_ID_PAID &&
      env.STRIPE_WEBHOOK_SECRET
  );
}

export function xuiConfigured(env: ServerEnv): boolean {
  return Boolean(env.XUI_BASE_URL && env.XUI_API_KEY);
}

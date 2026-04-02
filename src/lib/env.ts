import { z } from "zod";

/** Unraid/Docker often pass empty string for unset variables; treat as undefined. */
function emptyToUndef(v: unknown): unknown {
  if (typeof v !== "string") return v;
  const t = v.trim();
  return t === "" ? undefined : v;
}

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.preprocess(emptyToUndef, z.string().optional()),
  STRIPE_SECRET_KEY: z.preprocess(emptyToUndef, z.string().optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndef, z.string().optional()),
  STRIPE_PRICE_ID_PAID: z.preprocess(emptyToUndef, z.string().optional()),
  XUI_BASE_URL: z.preprocess(emptyToUndef, z.string().url().optional()),
  XUI_API_KEY: z.preprocess(emptyToUndef, z.string().optional()),
  XUI_BOUQUET_IDS: z.preprocess(emptyToUndef, z.string().optional()),
  XUI_MAX_CONNECTIONS: z.preprocess(emptyToUndef, z.string().optional()),
  XUI_SUBSCRIPTION_LENGTH: z.preprocess(emptyToUndef, z.string().optional()),
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

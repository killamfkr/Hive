# StreamLab Forum

A Next.js forum focused on **technology**, **servers**, and **IPTV**, with **free** and **paid (Pro)** memberships.

- **Free**: Register, sign in, browse and post in public categories.
- **Pro**: Monthly subscription via **Stripe**. After successful checkout, a **Stripe webhook** upgrades the user and, when configured, calls the **XUI.one Admin API** to `create_line` once. On each **subscription renewal** (`invoice.paid` with `billing_reason: subscription_cycle`), the app calls `edit_line` to extend the line.

## Local development

```bash
cp .env.example .env
# Edit .env — at minimum AUTH_SECRET and DATABASE_URL (SQLite default works)

npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.example` for `DATABASE_URL`, `AUTH_SECRET`, Stripe keys, price ID, webhook secret, and XUI base URL / API key / bouquet IDs.

## Stripe webhook

Point a Stripe webhook at `/api/webhooks/stripe` and subscribe at minimum to:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`

## XUI notes

Panel APIs vary slightly by build. If `create_line` or `edit_line` expect different parameter names, adjust `src/lib/xui.ts`. Credentials for new lines are stored on the user record and shown on the **Account** page (treat this as sensitive in production).

## Production database

Switch `DATABASE_URL` to PostgreSQL and run `prisma migrate deploy` (already part of `npm run build`).

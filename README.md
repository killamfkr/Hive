# Hive Tech Forum

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

## Run on Unraid (Docker)

The repo includes a **production Dockerfile** (Next.js `standalone` + `prisma migrate deploy` on each start).

### 1. Build the image on Unraid

On your PC or on the server (Community Applications **Docker** tab → terminal, or SSH):

```bash
git clone <your-repo-url> hive-tech-forum
cd hive-tech-forum
docker build -t hive-tech-forum:latest .
```

### 2. Create appdata for the database

On Unraid, create a folder that will hold the SQLite file, for example:

`/mnt/user/appdata/hive-tech-forum`

The container runs as user **nextjs (UID 1001)**. If migrations fail with a permission error, allow that UID to write the folder:

```bash
chown -R 1001:1001 /mnt/user/appdata/hive-tech-forum
```

### 3. Run the container

**Docker run** (adjust IP, secrets, and paths):

```bash
docker run -d --name hive-tech-forum --restart unless-stopped \
  -p 3000:3000 \
  -v /mnt/user/appdata/hive-tech-forum:/data \
  -e DATABASE_URL="file:/data/forum.db" \
  -e AUTH_SECRET="paste-output-of-openssl-rand-base64-32" \
  -e NEXTAUTH_URL="https://forum.yourdomain.com" \
  -e STRIPE_SECRET_KEY="sk_live_..." \
  -e STRIPE_WEBHOOK_SECRET="whsec_..." \
  -e STRIPE_PRICE_ID_PAID="price_..." \
  -e XUI_BASE_URL="https://panel:9000/accesscode" \
  -e XUI_API_KEY="..." \
  -e XUI_BOUQUET_IDS="1" \
  hive-tech-forum:latest
```

- **`NEXTAUTH_URL`** must match how users open the site (e.g. `https://forum.example.com` if you use Swag / Nginx Proxy Manager).
- **Stripe webhooks** must reach your public URL: `https://forum.example.com/api/webhooks/stripe`.

### 4. Reverse proxy (recommended)

Put the app behind **Swag**, **Nginx Proxy Manager**, or Cloudflare Tunnel: proxy to `http://UNRAID_IP:3000` (or the container’s Docker network address). Use HTTPS so cookies and Stripe callbacks behave correctly.

### 5. Seed forum categories (first deploy only)

Categories are created by the seed script. Inside the running container:

```bash
docker exec -it hive-tech-forum sh -c 'cd /app && npx prisma db seed'
```

(`npx` may download Prisma briefly unless you add a seed step to the image later.)

### docker-compose

See `docker-compose.yml` for a template (edit paths and environment variables).

### Unraid template

XML template: [`unraid/hive-tech-forum.xml`](unraid/hive-tech-forum.xml) — copy to `/boot/config/plugins/dockerMan/templates-user/` or use the [raw URL](https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml).

The template **omits `TemplateURL`** so Unraid does not overwrite your settings when you apply changes. Use **docker pull** / container update for new images.

If the container **restarts in a loop**, open **Logs** and see [`unraid/README.md`](unraid/README.md) (AUTH_SECRET, `/data` mount, `chown 1001:1001`, NEXTAUTH_URL).

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

- **SQLite**: mount a host directory to `/data` and set `DATABASE_URL=file:/data/forum.db` (as in the Unraid section).
- **PostgreSQL**: set `DATABASE_URL` to your server URL; migrations still run at container start via `docker-entrypoint.sh`.

For CI pipelines that build without a database, use `npm run build:ci` (runs `migrate deploy` during the build). The default `npm run build` only generates the Prisma client and builds Next.js.

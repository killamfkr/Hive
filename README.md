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

### Pre-built image (GitHub Container Registry)

On each push to **`main`**, [GitHub Actions](.github/workflows/docker-publish.yml) builds and pushes:

`ghcr.io/killamfkr/hive:latest`

**Pull and run** (no clone or build):

```bash
docker pull ghcr.io/killamfkr/hive:latest
```

If you see **“denied”** or **“unauthorized”**, the package may still be **private**. Open [github.com/killamfkr?tab=packages](https://github.com/killamfkr?tab=packages) → **hive** → **Package settings** → **Change package visibility** → **Public** (or sign in with `docker login ghcr.io` using a GitHub PAT with `read:packages`).

Use the same image name in Unraid’s Docker UI, or use `docker-compose.yml` in this repo (`docker compose pull && docker compose up -d`).

### Build locally (optional)

```bash
git clone https://github.com/killamfkr/Hive.git hive-tech-forum
cd hive-tech-forum
docker build -t hive-tech-forum:latest .
```

### 1. Create appdata for the database

On Unraid, create a folder that will hold the SQLite file, for example:

`/mnt/user/appdata/hive-tech-forum`

The container runs as user **nextjs (UID 1001)**. If migrations fail with a permission error, allow that UID to write the folder:

```bash
chown -R 1001:1001 /mnt/user/appdata/hive-tech-forum
```

### 2. Run the container

**Docker run** with the **pre-built** image (adjust secrets and paths):

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
  ghcr.io/killamfkr/hive:latest
```

To use a **locally built** image instead, replace the last line with `hive-tech-forum:latest`.

- **`NEXTAUTH_URL`** must match how users open the site (e.g. `https://forum.example.com` if you use Swag / Nginx Proxy Manager).
- **Stripe webhooks** must reach your public URL: `https://forum.example.com/api/webhooks/stripe`.

### 3. Reverse proxy (recommended)

Put the app behind **Swag**, **Nginx Proxy Manager**, or Cloudflare Tunnel: proxy to `http://UNRAID_IP:3000` (or the container’s Docker network address). Use HTTPS so cookies and Stripe callbacks behave correctly.

### 4. Seed forum categories (first deploy only)

Categories are created by the seed script. Inside the running container:

```bash
docker exec -it hive-tech-forum sh -c 'cd /app/prisma-migrate && node node_modules/prisma/build/index.js db seed'
```

(`npx` may download Prisma briefly unless you add a seed step to the image later.)

### docker-compose

See `docker-compose.yml` for a template (edit paths and environment variables).

### Unraid template

XML template: [`unraid/hive-tech-forum.xml`](unraid/hive-tech-forum.xml). Copy to `/boot/config/plugins/dockerMan/templates-user/` or use the [raw URL](https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml).

The template **does not include `TemplateURL`**, so Unraid should **not** reset your fields when you click **Apply**. Refresh the image with **`docker pull ghcr.io/killamfkr/hive:latest`** (or Unraid’s update) after we publish fixes.

If the container **restarts in a loop**, open **Logs** (Docker tab → click container name → Logs, or `docker logs Hive-Tech-Forum`). Unraid needs a **PNG** icon URL for the logo to show; the template points at `public/unraid-icon.png`. Details: [`unraid/README.md`](unraid/README.md).

If Unraid shows **Execution error** and the container **never starts** (no logs), the failure is usually **before** the app runs — often **GHCR pull** or a **bad Registry + Repository** combo. **SSH**: `docker pull ghcr.io/killamfkr/hive:latest` and see [`unraid/README.md`](unraid/README.md) (foreground `docker run`, `SKIP_DB_MIGRATE`).

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

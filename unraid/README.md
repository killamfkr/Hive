# Unraid Docker template

## Files

| File | Purpose |
|------|---------|
| [`hive-tech-forum.xml`](hive-tech-forum.xml) | Unraid **Add Container** template |

**Raw URL** (download or reference):

`https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml`

## Install

1. Copy `hive-tech-forum.xml` to `/boot/config/plugins/dockerMan/templates-user/` on your Unraid flash drive, **or** download the raw URL into that folder.
2. **Docker** → **Add Container** → select **Hive-Tech-Forum**.

## Container won’t start (restart loop)

1. **Docker** → container → **Logs**. Common causes:
   - **`AUTH_SECRET`** missing or empty — set a long random value (`openssl rand -base64 32`).
   - **No `/data` mapping** — you must add a **path** mapping: host folder → container **`/data`** (see template “Appdata”).
   - **Appdata permissions** — run: `chown -R 1001:1001 /mnt/user/appdata/hive-tech-forum`
   - **`NEXTAUTH_URL`** wrong — must match how you open the site (including `http` vs `https` and port).

2. **Optional env vars**: leave **Stripe** and **XUI** fields **completely blank** if unused. A single space in a URL field used to crash the app (fixed in newer images); update the image if needed.

## Settings reset when you click Apply

Older templates included **`<TemplateURL>`**, which makes Unraid **re-fetch** the template from GitHub and can **overwrite** your fields on apply.

This template **does not** include `TemplateURL` so your values stay put. To upgrade the app image, use **Check for updates** / **force update** for the container, or `docker pull ghcr.io/killamfkr/hive:latest` and recreate.

## After first start

```bash
docker exec -it Hive-Tech-Forum sh -c 'cd /app && npx prisma db seed'
```

## Community Applications

Submitting to the public CA catalog is separate; this XML works as a **user template** on your server.

# Unraid Docker template

Community Applications–style Docker template for **Hive Tech Forum**.

## Files

| File | Purpose |
|------|---------|
| [`hive-tech-forum.xml`](hive-tech-forum.xml) | Unraid **Add Container** definition |

**Raw URL** (bookmark or download):

`https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml`

## Install on Unraid

### Option A — Copy to flash drive

1. Download the [raw `hive-tech-forum.xml`](https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml).
2. Save to: `/boot/config/plugins/dockerMan/templates-user/`
3. **Docker** → **Add Container** → select **Hive-Tech-Forum**.

### Option B — Import from URL

On **Add Container**, use **Import** / **Template from URL** (wording varies) and paste the raw GitHub URL above.

### Option C — Authoring mode

**Settings → Docker → Enable Docker authoring mode**, then add a template repo or paste the XML in **Advanced view**.

## No icon / how to open logs

Unraid often **does not show SVG** icons from GitHub; this template uses a **PNG** icon (`public/unraid-icon.png`). After updating the template XML, **edit** the container once and **Apply** so Unraid refreshes the icon URL.

**Logs** (if you do not see a log icon):

- **Docker** tab → scroll the installed containers list → click the **container name** **Hive-Tech-Forum** → choose **Logs** (wording varies slightly by Unraid version).
- Or **Main / Terminal** (or SSH) and run:  
  `docker logs Hive-Tech-Forum`  
  or follow live output:  
  `docker logs -f --tail 200 Hive-Tech-Forum`

If there is **no row** for the container, it never started — check the error when you clicked **Apply**, or run `docker ps -a | grep -i hive`.

## Container won’t start (restart loop)

1. Open logs (see above). Typical causes:
   - **`AUTH_SECRET`** missing — use `openssl rand -base64 32`.
   - **No `/data` path** — host folder must map to container **`/data`** (template “Appdata”).
   - **Permissions** — `chown -R 1001:1001 /mnt/user/appdata/hive-tech-forum`
   - **`NEXTAUTH_URL`** — must match the URL you use in the browser (`http` vs `https`, host, port).

2. **Optional fields**: leave Stripe and XUI variables **empty** if unused. Empty strings are OK in current images; avoid stray spaces in URL fields.

3. **`docker pull` denied**: make the [GHCR package](https://github.com/killamfkr?tab=packages) public or run `docker login ghcr.io`.

## Settings reset when you click Apply

Including **`<TemplateURL>`** in the XML makes Unraid **re-fetch** the template from GitHub and can **overwrite** your values on apply.

This template **does not** use `TemplateURL`, so your settings persist. Update the app by **pulling a newer image** (`docker pull ghcr.io/killamfkr/hive:latest`) or using Unraid’s container update actions.

## After first start

```bash
docker exec -it Hive-Tech-Forum sh -c 'cd /app && npx prisma db seed'
```

Set **NEXTAUTH_URL** to your real public URL if you use **Swag** / **Nginx Proxy Manager**.

## Community Applications (public store)

To publish in the official CA feed, follow the [Unraid template submission process](https://forums.unraid.net/topic/101424-how-to-publish-docker-templates-to-community-applications-on-unraid/). This XML works as a **user template** without that step.

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

## “Execution error” when starting (container never runs — no logs)

Unraid shows **Execution error** when **Docker refuses to create/start** the container. There are **no logs** until a container exists.

### 1. Fix the image reference (most common on Unraid + GHCR)

The template uses a **full** image name: `ghcr.io/killamfkr/hive:latest`.

- In **Add / Edit container → Show more settings → Extra Parameters / Registry**, make sure you are **not** setting **Registry** to `ghcr.io` **again** (double-prefix breaks pulls). The stock template **does not** set `<Registry>` for that reason.
- If you previously saved a bad value, **edit the container**, clear custom registry fields, **Repository** must be exactly:  
  `ghcr.io/killamfkr/hive:latest`

### 2. Prove the image pulls (SSH on Unraid)

```bash
docker pull ghcr.io/killamfkr/hive:latest
```

- **denied / unauthorized** → make the [GitHub package](https://github.com/killamfkr?tab=packages) **Public**, or `docker login ghcr.io` (PAT with `read:packages`).
- **manifest unknown** → typo in name or image not built yet (check [Actions](https://github.com/killamfkr/Hive/actions)).

### 3. Run once in the foreground (see the real error)

Replace env values and host path:

```bash
docker run --rm -it \
  -p 3000:3000 \
  -v /mnt/user/appdata/hive-tech-forum:/data \
  -e DATABASE_URL=file:/data/forum.db \
  -e AUTH_SECRET='paste-a-long-secret' \
  -e NEXTAUTH_URL='http://YOUR_UNRAID_IP:3000' \
  ghcr.io/killamfkr/hive:latest
```

Read the **first lines** printed (migrations, Node stack traces). If migrations are suspect, add **`-e SKIP_DB_MIGRATE=1`** (debug only) in the Unraid template under Advanced, or in this command, to see whether the app **node server.js** starts.

### 4. Other Unraid quirks

- **Settings → Docker**: disable Docker, enable again if the UI always returns generic errors.
- **Path**: host folder for `/data` must exist; `mkdir -p /mnt/user/appdata/hive-tech-forum` and `chown -R 1001:1001 …` if SQLite errors appear **after** the container finally starts.

---

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
docker exec -it Hive-Tech-Forum sh -c 'cd /app/prisma-migrate && node node_modules/prisma/build/index.js db seed'
```

Uses the bundled **prisma-migrate** install (no `npx` / network).

Set **NEXTAUTH_URL** to your real public URL if you use **Swag** / **Nginx Proxy Manager**.

## Web UI is blank / nothing shows

1. **URL and port** — Open `http://UNRAID_IP:3000` (use your **mapped host port** if you changed it from 3000).

2. **Unraid “WebUI” link** — It only matches if the **container port 3000** is published to that same port on the host.

3. **Reverse proxy** — If you use a domain, confirm the proxy **target** is `http://UNRAID_IP:3000` (or the container IP) and returns **200** for `/`.

4. **Quick check** (SSH on Unraid):
   ```bash
   curl -sI http://127.0.0.1:3000/
   ```
   Expect `HTTP/1.1 200`. **Connection refused** → container not listening; check `docker ps` and `docker logs Hive-Tech-Forum`.

5. **Hard refresh** the browser (`Ctrl+Shift+R`).

## Community Applications (public store)

To publish in the official CA feed, follow the [Unraid template submission process](https://forums.unraid.net/topic/101424-how-to-publish-docker-templates-to-community-applications-on-unraid/). This XML works as a **user template** without that step.

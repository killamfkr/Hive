# Unraid Docker template

This folder contains a **Community Applications–style** Docker template for **Hive Tech Forum**.

## Files

| File | Purpose |
|------|---------|
| [`hive-tech-forum.xml`](hive-tech-forum.xml) | Container definition (ports, paths, env vars) |

**Stable raw URL** (for import or CA `TemplateURL`):

`https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml`

## Install on Unraid

### Option A — Copy to flash drive

1. Download [`hive-tech-forum.xml`](https://raw.githubusercontent.com/killamfkr/Hive/main/unraid/hive-tech-forum.xml).
2. Place it on your Unraid flash drive under:
   - `/boot/config/plugins/dockerMan/templates-user/`
3. **Docker** → **Add Container** → select **Hive-Tech-Forum** from the template list.

### Option B — Import from URL (if your Unraid version supports it)

On the **Add Container** screen, use **Import** / **Template from URL** (wording varies by version) and paste the **raw GitHub URL** above.

### Option C — Authoring mode

**Settings → Docker → Enable Docker authoring mode**, then add a custom template repository that includes this XML, or paste the XML in **Advanced view** when adding a container.

## After deploy

1. Create appdata if needed and ensure **UID 1001** can write it:  
   `chown -R 1001:1001 /mnt/user/appdata/hive-tech-forum`
2. Set **NEXTAUTH_URL** to your real URL (HTTPS behind **Swag** / **Nginx Proxy Manager**).
3. Seed forum categories once:
   ```bash
   docker exec -it Hive-Tech-Forum sh -c 'cd /app && npx prisma db seed'
   ```

## Publishing to Community Applications

To list this app in the public CA store, follow the [Unraid Docker template submission process](https://forums.unraid.net/topic/101424-how-to-publish-docker-templates-to-community-applications-on-unraid/) (maintainer profile, testing, submission form). Until then, use the raw XML URL or copy the file locally as above.

# Production image for Unraid / Docker hosts (Next.js standalone + Prisma migrate at start)

FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma/
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Full Prisma CLI dependency tree (effect, c12, …) — Next standalone trace omits these
FROM base AS prisma-migrate
WORKDIR /prisma-migrate
COPY prisma ./prisma/
RUN printf '%s\n' \
  '{"name":"prisma-migrate","private":true,"dependencies":{"prisma":"6.19.2","tsx":"4.21.0","@prisma/client":"6.19.2"},"prisma":{"seed":"tsx prisma/seed.ts"}}' \
  > package.json \
  && npm install --omit=dev \
  && DATABASE_URL="file:./.build-generate.db" npx prisma generate --schema=./prisma/schema.prisma

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs \
  && mkdir -p /data \
  && chown nextjs:nodejs /data

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=prisma-migrate --chown=nextjs:nodejs /prisma-migrate ./prisma-migrate

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

ENTRYPOINT ["./docker-entrypoint.sh"]

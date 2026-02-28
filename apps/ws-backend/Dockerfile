FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /repo
COPY . .
RUN pnpm dlx turbo prune --scope=ws-backend --docker

FROM base AS installer
WORKDIR /repo
COPY --from=builder /repo/out/json/ .
COPY --from=builder /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile
COPY --from=builder /repo/out/full/ .
RUN pnpm turbo run build --filter=ws-backend

FROM base AS runner
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=installer --chown=nodeuser:nodejs /repo/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=installer --chown=nodeuser:nodejs /repo/package.json ./package.json
COPY --from=installer --chown=nodeuser:nodejs /repo/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=installer --chown=nodeuser:nodejs /repo/apps/ws-backend/package.json ./apps/ws-backend/package.json
COPY --from=installer --chown=nodeuser:nodejs /repo/packages/db/package.json ./packages/db/package.json
COPY --from=installer --chown=nodeuser:nodejs /repo/packages/shared/package.json ./packages/shared/package.json
RUN pnpm install --frozen-lockfile --prod
COPY --from=installer --chown=nodeuser:nodejs /repo/apps/ws-backend/dist ./apps/ws-backend/dist
COPY --from=installer --chown=nodeuser:nodejs /repo/packages/db/prisma ./packages/db/prisma
USER nodeuser
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:8080 >/dev/null || exit 1
CMD ["sh", "-c", "npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma && node apps/ws-backend/dist/index.js"]
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app ./

EXPOSE 8080

CMD ["node", "dist/index.js"]
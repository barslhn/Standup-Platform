FROM node:20-alpine AS builder
WORKDIR /app

ENV CI=true
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
RUN pnpm config set node-linker hoisted

COPY backend/package.json backend/pnpm-lock.yaml ./
COPY backend/ .

RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/src/main.js"]

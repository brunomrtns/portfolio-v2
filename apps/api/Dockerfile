# ── Portfolio API — Dockerfile (multi-stage) ───────────────────────────────────

# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable pnpm

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages/types/package.json packages/types/tsconfig.json ./packages/types/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json apps/api/tsconfig.json ./apps/api/

# Install dependencies (frozen lockfile)
RUN pnpm install --frozen-lockfile

# Copy source for packages (needed to build them)
COPY packages/types/src ./packages/types/src
COPY packages/shared/src ./packages/shared/src

# Copy API source
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/src ./apps/api/src

# Copy root tsconfig
COPY tsconfig.json ./

# Build shared packages first
RUN pnpm --filter @portfolio/types build
RUN pnpm --filter @portfolio/shared build

# Generate Prisma client
RUN pnpm --filter @portfolio/api exec prisma generate

# Build API
RUN pnpm --filter @portfolio/api build

# Bundle seed file with esbuild (for production seed via `node`)
RUN cd apps/api && pnpm exec esbuild prisma/seeds/index.ts --bundle --platform=node --format=cjs --outfile=dist/seeds/index.js --external=@prisma/client --external=@portfolio/shared 2>&1 || \
    pnpm exec esbuild prisma/seeds/index.ts --bundle --platform=node --format=cjs --outfile=dist/seeds/index.js --external:@prisma/client 2>&1
RUN ls -la apps/api/dist/seeds/index.js

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runtime

RUN apk add --no-cache libc6-compat openssl wget

WORKDIR /app

RUN corepack enable pnpm

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Copy built packages
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy Prisma schema and migrations
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

# Copy built API
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Copy root tsconfig (needed for package resolution)
COPY tsconfig.json ./

WORKDIR /app/apps/api

# Generate Prisma client in runtime (needs the schema)
RUN pnpm exec prisma generate

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3104

EXPOSE 3104

# Run migrations on start, then start the server
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]

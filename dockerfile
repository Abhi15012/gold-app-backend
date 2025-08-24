# ---- Base: Install deps and build ----
FROM oven/bun:1 AS base
WORKDIR /app

# Copy lockfile & package.json first
COPY bun.lock package.json ./
COPY prisma ./prisma

# Install dependencies
RUN bun install

# Generate Prisma client (doesn't need DB connection)
RUN bunx prisma generate

# Copy source
COPY tsconfig.json ./
COPY . .

# Build TypeScript
RUN bun run build

# ---- Prune for production ----
FROM base AS prune
RUN bun install --production

# ---- Runtime ----
FROM oven/bun:1 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime essentials
COPY --from=prune /app/node_modules ./node_modules
COPY --from=base  /app/prisma       ./prisma
COPY --from=base  /app/dist         ./dist
COPY package.json ./

EXPOSE 3000
ENV PORT=3000

# Run migrations at container startup (runtime)
CMD bunx prisma migrate deploy && bun run dist/index.js
# CMD ["bun", "run", "dist/index.js"]
# ---- DEV ----
FROM base AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["bun", "run", "dev"]
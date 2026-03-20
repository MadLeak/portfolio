# ---- Stage 1: Build frontend ----
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---- Stage 2: Production runner ----
FROM oven/bun:1-slim AS runner

WORKDIR /app

COPY --from=builder /app/dist              ./dist
COPY --from=builder /app/server.ts         ./server.ts
COPY --from=builder /app/tsconfig.server.json ./tsconfig.server.json
COPY --from=builder /app/package.json      ./package.json
COPY --from=builder /app/node_modules      ./node_modules

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["bun", "run", "--tsconfig-override", "tsconfig.server.json", "server.ts"]

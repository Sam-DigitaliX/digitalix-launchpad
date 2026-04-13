# ── Build stage ──
FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Production stage ──
FROM node:20-slim
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Install Chromium + all required system dependencies automatically
RUN npx playwright install --with-deps chromium

COPY --from=builder /app/dist ./dist
COPY migrations ./migrations
EXPOSE 3000
CMD ["sh", "-c", "node dist/lib/migrate.js && node dist/index.js"]

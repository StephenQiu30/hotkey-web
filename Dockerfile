# =============================================================================
# Stage 1: Dependencies (cached separately)
# =============================================================================
FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG HOTKEY_API_ORIGIN=http://host.docker.internal:8080
ENV HOTKEY_API_ORIGIN=$HOTKEY_API_ORIGIN
ENV NEXT_OUTPUT=standalone

RUN npm run build

# =============================================================================
# Stage 3: Production runner (Next.js standalone)
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup -S hotkey && adduser -S hotkey -G hotkey

# Copy standalone server + static assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER hotkey

EXPOSE 3000

CMD ["node", "server.js"]

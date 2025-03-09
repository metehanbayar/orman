FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Sistem kullanıcısı ve grubu oluştur
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Gerekli dizinleri oluştur ve izinleri ayarla
RUN mkdir -p /app/public/dishes /app/public/categories /app/data && \
    chown -R nextjs:nodejs /app && \
    chmod -R 755 /app && \
    chmod -R 777 /app/public && \
    chmod -R 777 /app/data

# Uygulama dosyalarını kopyala
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# İzinleri son kez kontrol et
RUN chmod -R 777 /app/public /app/data && \
    chown -R nextjs:nodejs /app/node_modules

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 
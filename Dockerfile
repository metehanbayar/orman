FROM node:20-alpine AS base

# Çalışma dizinini ayarla
WORKDIR /app

# Bağımlılıkları kopyala
COPY package.json package-lock.json ./

# Geliştirme aşaması
FROM base AS deps
RUN npm ci

# Derleme aşaması
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

# Veri dizinini oluştur (derleme sırasında)
RUN mkdir -p ./data
RUN echo "[]" > ./data/products.json
RUN echo "[]" > ./data/categories.json

# Next.js uygulamasını derle
RUN npm run build

# Çalıştırma aşaması
FROM base AS runner
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Gereksiz dosyaları içermeyen daha minimal bir üretim ortamı
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Paylaşılan dosya izinleri için data dizini oluştur
RUN mkdir -p /app/data
RUN mkdir -p /app/public/dishes
RUN chown -R nextjs:nodejs /app

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/data/ ./data/

# Data dizini ve uploads dizinlerine yazma izni ver
RUN chmod 777 /app/data
RUN chmod 777 /app/public/dishes

USER nextjs

EXPOSE 3000

ENV PORT 3000

# Veri dizinini kalıcı depolama için volume olarak tanımla
VOLUME ["/app/data", "/app/public/dishes"]

CMD ["node", "server.js"] 
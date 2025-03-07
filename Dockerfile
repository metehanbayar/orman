FROM node:18-alpine

WORKDIR /app

# Gerekli paketleri kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama dosyalarını kopyala
COPY . .

# Dizinleri oluştur ve izinleri ayarla
RUN mkdir -p /app/public/dishes /app/data \
    && chown -R node:node /app \
    && chmod -R 755 /app/public/dishes /app/data

# node kullanıcısına geç
USER node

# Uygulamayı derle
RUN npm run build

# Portu aç
EXPOSE 3000

# Uygulamayı başlat
CMD ["npm", "start"] 
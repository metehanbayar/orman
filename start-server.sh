#!/bin/bash

# Bu script, Next.js uygulamasını Linux sunucusunda başlatır
# Plesk sunucusunda çalıştırılmalıdır

# Değişkenler
APP_DIR=$(pwd)
PORT=3000
NODE_ENV=production

# Bağımlılıkları yükle (gerekirse)
if [ ! -d "$APP_DIR/node_modules" ]; then
  echo "Node.js bağımlılıkları yükleniyor..."
  npm install
fi

# Uygulamayı build et (gerekirse)
if [ ! -d "$APP_DIR/.next" ]; then
  echo "Uygulama build ediliyor..."
  npm run build
fi

# Data klasörünün varlığını kontrol et
if [ ! -d "$APP_DIR/data" ]; then
  echo "Data klasörü oluşturuluyor..."
  mkdir -p "$APP_DIR/data"
  touch "$APP_DIR/data/products.json"
  touch "$APP_DIR/data/categories.json"
  echo "[]" > "$APP_DIR/data/products.json"
  echo "[]" > "$APP_DIR/data/categories.json"
fi

# PM2 yüklü mü kontrol et
if ! command -v pm2 &> /dev/null; then
  echo "PM2 yükleniyor..."
  npm install -g pm2
fi

# Uygulamayı PM2 ile başlat
echo "Uygulama başlatılıyor..."
pm2 delete orman-menu 2>/dev/null || true
pm2 start npm --name "orman-menu" -- start

echo ""
echo "Uygulama başlatıldı!"
echo "Port: $PORT"
echo "PM2 durumunu kontrol etmek için: pm2 status"
echo "Logları görmek için: pm2 logs orman-menu" 
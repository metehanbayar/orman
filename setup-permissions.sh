#!/bin/bash

# Bu script, Linux sunucusunda data klasörü ve içindeki dosyalar için gerekli izinleri ayarlar
# Plesk sunucusunda çalıştırılmalıdır

# Değişkenler
APP_DIR=$(pwd)
DATA_DIR="$APP_DIR/data"
WEB_USER="www-data" # Plesk için genellikle www-data veya nginx kullanıcısıdır

# Data klasörünü oluştur (yoksa)
mkdir -p "$DATA_DIR"

# Data klasörü ve içindeki dosyalar için izinleri ayarla
chmod 755 "$DATA_DIR"
touch "$DATA_DIR/products.json"
touch "$DATA_DIR/categories.json"
chmod 664 "$DATA_DIR"/*.json

# Web sunucusu kullanıcısına yazma izni ver
chown -R $WEB_USER:$WEB_USER "$DATA_DIR"

echo "İzinler başarıyla ayarlandı."
echo "Data klasörü: $DATA_DIR"
echo "Web kullanıcısı: $WEB_USER"

# Mevcut izinleri göster
ls -la "$DATA_DIR"

echo ""
echo "NOT: Bu scripti root veya sudo yetkisi olan bir kullanıcı olarak çalıştırın."
echo "Örnek: sudo bash setup-permissions.sh" 
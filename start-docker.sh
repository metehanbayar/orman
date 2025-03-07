#!/bin/bash

# Renkli çıktı için
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}QR Menü Docker Başlatma Aracı${NC}"
echo "------------------------------"

# .env dosyası kontrolü
if [ ! -f .env ]; then
    echo -e "${RED}HATA: .env dosyası bulunamadı!${NC}"
    
    # Örnek .env dosyası oluştur
    echo -e "${YELLOW}Örnek .env dosyası oluşturuluyor...${NC}"
    cat > .env << 'EOF'
DB_USER=sa
DB_PASSWORD=veritabani_sifre
DB_SERVER=veritabani_host
DB_NAME=Samba-Merkez

# MSSQL Bağlantı Bilgileri
MSSQL_USER=sa
MSSQL_PASSWORD=veritabani_sifre
MSSQL_SERVER=veritabani_host
MSSQL_DATABASE=Samba-Merkez
EOF
    
    echo -e "${YELLOW}.env dosyası oluşturuldu. Lütfen veritabanı bilgilerinizi düzenleyin:${NC}"
    echo -e "${YELLOW}nano .env${NC}"
    exit 1
fi

# Docker ve Docker Compose kontrolü
if ! command -v docker &> /dev/null; then
    echo -e "${RED}HATA: Docker kurulu değil!${NC}"
    echo -e "Docker kurulum talimatları için DOCKER_KURULUM.md dosyasına bakın."
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}HATA: Docker Compose kurulu değil!${NC}"
    echo -e "Docker kurulum talimatları için DOCKER_KURULUM.md dosyasına bakın."
    exit 1
fi

# Dizinleri oluştur ve izinlerini ayarla
echo -e "${YELLOW}Dizinleri kontrol ediliyor...${NC}"

# Data klasörü kontrolü
if [ ! -d "./data" ]; then
    echo -e "${YELLOW}data klasörü bulunamadı, oluşturuluyor...${NC}"
    mkdir -p data
    
    # Boş products.json ve categories.json oluştur
    echo "[]" > data/products.json
    echo "[]" > data/categories.json
    
    echo -e "${GREEN}data klasörü oluşturuldu.${NC}"
fi

# Public/dishes klasörü kontrolü
if [ ! -d "./public/dishes" ]; then
    echo -e "${YELLOW}public/dishes klasörü bulunamadı, oluşturuluyor...${NC}"
    mkdir -p public/dishes
    echo -e "${GREEN}public/dishes klasörü oluşturuldu.${NC}"
fi

# İzinleri ayarla
echo -e "${YELLOW}Dizin izinleri ayarlanıyor...${NC}"
chmod -R 777 data
chmod -R 777 public/dishes

# Mevcut konteyner varsa durdur
echo -e "${YELLOW}Eski konteynerleri durduruluyor...${NC}"
docker compose down

# Docker imajını oluştur ve çalıştır
echo -e "${YELLOW}Docker imajı oluşturuluyor...${NC}"
docker compose build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Docker imajı başarıyla oluşturuldu.${NC}"
    echo -e "${YELLOW}Uygulama başlatılıyor...${NC}"
    docker compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}QR Menü uygulaması başarıyla başlatıldı!${NC}"
        echo -e "Aşağıdaki URL'den erişebilirsiniz:"
        
        # Sunucu IP adresini al (Linux)
        IP=$(hostname -I | awk '{print $1}')
        if [ -z "$IP" ]; then
            IP="localhost"
        fi
        
        echo -e "${GREEN}http://$IP:3000${NC}"
        echo -e "${GREEN}http://$IP:3000/admin${NC} (Yönetim Paneli)"
        
        # Konteyneri izleme
        echo -e "\n${YELLOW}Container logları görüntüleniyor...${NC}"
        docker compose logs -f
    else
        echo -e "${RED}Uygulama başlatılırken hata oluştu!${NC}"
        echo -e "${YELLOW}Logları kontrol edin:${NC} docker compose logs"
    fi
else
    echo -e "${RED}Docker imajı oluşturulurken hata oluştu!${NC}"
fi 
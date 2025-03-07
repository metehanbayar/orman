# Linux Sunucusunda Kurulum ve Çalıştırma Talimatları

Bu belge, uygulamanın Linux sunucusunda (Plesk) kurulumu ve çalıştırılması için gerekli adımları içerir.

## Gereksinimler

- Node.js 18.x veya üzeri
- npm 9.x veya üzeri
- PM2 (Node.js uygulamaları için süreç yöneticisi)

## Kurulum Adımları

### 1. Uygulamayı Sunucuya Yükleyin

```bash
# Sunucuda uygulamanın çalışacağı dizine gidin
cd /var/www/vhosts/domain.com/httpdocs

# Uygulamayı git ile klonlayın (veya dosyaları FTP ile yükleyin)
git clone https://github.com/kullanici/orman.git
cd orman
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Dosya İzinlerini Ayarlayın

Uygulamanın data klasörüne yazma izni olduğundan emin olun:

```bash
# İzin ayarlama scriptini çalıştırın
sudo bash setup-permissions.sh
```

### 4. Uygulamayı Build Edin

```bash
npm run build
```

### 5. Uygulamayı Başlatın

```bash
# Başlatma scriptini çalıştırın
bash start-server.sh
```

## Sorun Giderme

### Dosya İzinleri Sorunları

Eğer uygulama dosya yazma hatası veriyorsa:

1. Data klasörünün ve içindeki dosyaların izinlerini kontrol edin:

```bash
ls -la data/
```

2. Web sunucusu kullanıcısının (genellikle www-data veya nginx) data klasörüne yazma izni olduğundan emin olun:

```bash
sudo chown -R www-data:www-data data/
sudo chmod -R 755 data/
sudo chmod 664 data/*.json
```

### PM2 ile İlgili Sorunlar

PM2 durumunu kontrol edin:

```bash
pm2 status
```

Logları kontrol edin:

```bash
pm2 logs orman-menu
```

Uygulamayı yeniden başlatın:

```bash
pm2 restart orman-menu
```

## Güncelleme

Uygulamayı güncellemek için:

```bash
# Güncel kodu çekin
git pull

# Bağımlılıkları güncelleyin
npm install

# Uygulamayı yeniden build edin
npm run build

# Uygulamayı yeniden başlatın
pm2 restart orman-menu
```

## Notlar

- Uygulama varsayılan olarak 3000 portunda çalışır. Bunu değiştirmek için `.env` dosyasında `PORT` değişkenini ayarlayın.
- Plesk'te bir proxy ayarı yaparak uygulamayı bir alt domain üzerinden erişilebilir yapabilirsiniz (örn: menu.domain.com).
- Dosya izinleri sorunları yaşarsanız, web sunucusu kullanıcısının (www-data, nginx vb.) data klasörüne yazma izni olduğundan emin olun. 
# QR Menü Uygulaması Docker Kurulum Talimatları

Bu belge, QR Menü uygulamasını Linux üzerinde Docker kullanarak nasıl yayınlayacağınızı açıklar.

## Ön Gereksinimler

Sisteminizde aşağıdaki yazılımların kurulu olması gerekmektedir:

- Docker (20.10.0 veya üzeri)
- Docker Compose (2.0.0 veya üzeri)

## 1. Docker Kurulumu

Eğer Docker kurulu değilse, aşağıdaki komutları kullanarak kurabilirsiniz:

```bash
# Docker sistemden kaldırma (eğer varsa)
sudo apt-get remove docker docker-engine docker.io containerd runc

# Gerekli paketleri yükleme
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Docker'ın resmi GPG anahtarını ekleme
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker'ın kararlı deposunu kurma
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine'i yükleme
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Docker'ı başlatma ve otomatik başlatma ayarı
sudo systemctl start docker
sudo systemctl enable docker

# Kullanıcıyı docker grubuna ekleme (sudo kullanmadan Docker komutları çalıştırabilmek için)
sudo usermod -aG docker $USER
```

Kurulumu doğrulamak için:

```bash
# Oturumu yeniden başlatın veya şu komutu çalıştırın:
newgrp docker

# Doğrulama
docker --version
docker compose version
```

## 2. QR Menü Uygulamasını Yayınlama

### 2.1 Proje Dizinine Gidin

```bash
cd /path/to/qr-menu-project
```

### 2.2 .env Dosyasını Oluşturun

Veritabanı bağlantı bilgilerinizi içeren bir `.env` dosyası oluşturun (eğer yoksa):

```bash
cat > .env << 'EOF'
DB_USER=sa
DB_PASSWORD=********
DB_SERVER=192.168.X.X
DB_NAME=Samba-Merkez

# MSSQL Bağlantı Bilgileri
MSSQL_USER=sa
MSSQL_PASSWORD=********
MSSQL_SERVER=192.168.X.X
MSSQL_DATABASE=Samba-Merkez
EOF
```

> **NOT**: Gerçek veritabanı bilgilerinizi yukarıdaki dosyaya ekleyin.

### 2.3 Docker İmajını Oluşturun ve Çalıştırın

```bash
# Docker imajını oluşturun
docker compose build

# Uygulamayı başlatın
docker compose up -d
```

### 2.4 Uygulamaya Erişim

Uygulama başarıyla başlatıldıktan sonra, aşağıdaki adresten erişebilirsiniz:

```
http://sunucu-ip-adresi:3000
```

## 3. Uygulama Yönetimi

### 3.1 Uygulamayı Durdurmak İçin

```bash
docker compose down
```

### 3.2 Güncellemeleri Uygulamak İçin

Kodda değişiklikler yapıldığında:

```bash
# Değişiklikleri çekin (eğer git kullanıyorsanız)
git pull

# İmajı yeniden oluşturun ve başlatın
docker compose build
docker compose up -d
```

### 3.3 Logları Görüntüleme

```bash
# Tüm logları görmek için
docker compose logs

# Gerçek zamanlı logları takip etmek için
docker compose logs -f
```

## 4. Ürün Yönetimi

Uygulama çalışırken, ürünleri yönetmek için admin panelini kullanabilirsiniz:

```
http://sunucu-ip-adresi:3000/admin
```

Admin paneli üzerinden şunları yapabilirsiniz:
- Ürün ekleme, düzenleme ve silme
- Kategori yönetimi
- Fiyat güncelleme
- MSSQL veritabanından fiyatları senkronize etme

## 5. Veri Yedekleme

Docker volume'u olarak ayarlanmış veri dizinini yedeklemek için:

```bash
# data klasörünü sıkıştırıp yedekleme
tar -czvf qr-menu-data-backup-$(date +%Y%m%d).tar.gz ./data
```

## 6. Sorun Giderme

### 6.1 Veritabanı Bağlantı Sorunları

Eğer veritabanına bağlantı sorunları yaşıyorsanız:

1. `.env` dosyasındaki bağlantı bilgilerini kontrol edin
2. Sunucu güvenlik duvarının 1433 portuna (MSSQL) izin verdiğinden emin olun
3. Docker loglarını kontrol edin: `docker compose logs qr-menu`

### 6.2 Docker Konteyner Başlatma Sorunları

```bash
# Konteynerin durumunu kontrol edin
docker ps -a

# Konteyneri yeniden başlatın
docker compose restart qr-menu
```

## 7. Güncelleme Talimatları

Yeni kod güncellemeleri yayınlandığında, uygulamayı şu adımlarla güncelleyebilirsiniz:

```bash
# Proje dizinine gidin
cd /path/to/qr-menu-project

# Yeni kodları çekin (eğer git kullanıyorsanız)
git pull

# İmajı yeniden oluşturun ve başlatın
docker compose down
docker compose build
docker compose up -d
``` 
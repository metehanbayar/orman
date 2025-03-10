const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = process.env.PORT || 3000;

// Projenin kök dizinini belirleme
const projectDir = __dirname;

console.log('Proje dizini:', projectDir);
console.log('Çalışma modu:', dev ? 'Development' : 'Production');

// Veri dizinlerini oluştur
const dataDir = path.join(projectDir, 'data');
const publicDir = path.join(projectDir, 'public');
const categoriesDir = path.join(publicDir, 'categories');
const dishesDir = path.join(publicDir, 'dishes');

// Mime tipleri
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

// Dizinleri ve izinleri kontrol et
(async function setupDirectories() {
  try {
    // data dizini kontrolü
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Data dizini oluşturuldu:', dataDir);
    }
    
    // public dizini kontrolü
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
      console.log('Public dizini oluşturuldu:', publicDir);
    }
    
    // categories dizini kontrolü
    if (!fs.existsSync(categoriesDir)) {
      fs.mkdirSync(categoriesDir, { recursive: true });
      console.log('Categories dizini oluşturuldu:', categoriesDir);
    }
    
    // dishes dizini kontrolü
    if (!fs.existsSync(dishesDir)) {
      fs.mkdirSync(dishesDir, { recursive: true });
      console.log('Dishes dizini oluşturuldu:', dishesDir);
    }
    
    // Ürünler dosyası kontrolü
    const productsFile = path.join(dataDir, 'products.json');
    if (!fs.existsSync(productsFile)) {
      fs.writeFileSync(productsFile, '[]');
      console.log('products.json dosyası oluşturuldu');
    }
    
    // Kategoriler dosyası kontrolü
    const categoriesFile = path.join(dataDir, 'categories.json');
    if (!fs.existsSync(categoriesFile)) {
      fs.writeFileSync(categoriesFile, '[]');
      console.log('categories.json dosyası oluşturuldu');
    }
    
    // Dizin izinlerini kontrol et ve düzelt
    if (process.platform !== 'win32') {
      try {
        await fs.promises.chmod(dataDir, 0o777);
        await fs.promises.chmod(publicDir, 0o777);
        await fs.promises.chmod(categoriesDir, 0o777);
        await fs.promises.chmod(dishesDir, 0o777);
        console.log('Dizin izinleri ayarlandı');
      } catch (chmodErr) {
        console.error('İzin ayarlama hatası:', chmodErr);
      }
    }
  } catch (error) {
    console.error('Dizin oluşturma hatası:', error);
  }
})();

const app = next({ dev, hostname, port, dir: projectDir });
const handle = app.getRequestHandler();

// Statik dosya servis fonksiyonu
function serveStaticFile(req, res, filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`Dosya bulunamadı: ${filePath}`);
      return false;
    }

    // Dosya istatistiklerini al
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      console.log(`Geçerli bir dosya değil: ${filePath}`);
      return false;
    }

    // Mime tipini belirle
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Dosyayı oku ve gönder
    const fileStream = fs.createReadStream(filePath);
    
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    fileStream.pipe(res);
    return true;
  } catch (err) {
    console.error(`Dosya servis hatası (${filePath}):`, err);
    return false;
  }
}

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const { pathname } = parsedUrl;
      
      // CORS başlıklarını ekle
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // OPTIONS istekleri için
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Yeni statik dosya servis mekanizması
      // /dishes ve /categories yollarından gelen istekleri doğrudan işle
      if (pathname.startsWith('/dishes/') || pathname.startsWith('/categories/')) {
        // Dosya yolunu belirle
        const relativePath = pathname.startsWith('/dishes/') 
          ? pathname.replace('/dishes/', '') 
          : pathname.replace('/categories/', '');
        
        const basePath = pathname.startsWith('/dishes/') ? dishesDir : categoriesDir;
        const filePath = path.join(basePath, relativePath);
        
        console.log(`Statik dosya istendi: ${pathname} => ${filePath}`);
        
        // Dosyayı servis et
        if (serveStaticFile(req, res, filePath)) {
          return; // Dosya servis edildi, devam etme
        }
      }
      
      // /public yolundan gelen istekleri doğrudan işle
      if (pathname.startsWith('/public/')) {
        const relativePath = pathname.replace('/public/', '');
        const filePath = path.join(publicDir, relativePath);
        
        if (serveStaticFile(req, res, filePath)) {
          return; // Dosya servis edildi, devam etme
        }
      }

      // Next.js tarafından işlenen statik dosyalar
      if (pathname.startsWith('/_next/') || 
          pathname.includes('.ico') || 
          pathname.includes('.png') || 
          pathname.includes('.jpg') || 
          pathname.includes('.jpeg') || 
          pathname.includes('.svg')) {
        await handle(req, res, parsedUrl);
        return;
      }

      // Next.js uygulama isteklerini handle et
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Hata oluştu:', err);
      res.statusCode = 500;
      res.end('Sunucu Hatası');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`QR Menü uygulaması http://${hostname}:${port} adresinde çalışıyor`);
  });
}); 
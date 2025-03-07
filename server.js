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
const dishesDir = path.join(publicDir, 'dishes');

// Dizinleri ve izinleri kontrol et
try {
  // data dizini kontrolü
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log('Data dizini oluşturuldu:', dataDir);
  }
  
  // public/dishes dizini kontrolü
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
  try {
    fs.accessSync(dataDir, fs.constants.W_OK);
    fs.accessSync(dishesDir, fs.constants.W_OK);
    console.log('Dizin yazma izinleri OK.');
  } catch (err) {
    console.warn('Dizin yazma izin hatası:', err.message);
    console.log('İzinleri düzeltmeye çalışılıyor...');
    
    // Chmod her platformda çalışmaz, özellikle Windows'ta
    try {
      if (process.platform !== 'win32') {
        fs.chmodSync(dataDir, 0o777);
        fs.chmodSync(dishesDir, 0o777);
        console.log('Dizin izinleri düzeltildi.');
      }
    } catch (chmodErr) {
      console.error('İzin düzeltme hatası:', chmodErr);
    }
  }
} catch (error) {
  console.error('Dizin oluşturma hatası:', error);
}

const app = next({ dev, hostname, port, dir: projectDir });
const handle = app.getRequestHandler();

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

      // Data dizini kontrolü
      const dataDir = path.join(projectDir, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('Data dizini oluşturuldu:', dataDir);
        
        // Eğer products.json yoksa boş bir dosya oluştur
        const productsFile = path.join(dataDir, 'products.json');
        if (!fs.existsSync(productsFile)) {
          fs.writeFileSync(productsFile, '[]');
          console.log('products.json dosyası oluşturuldu');
        }
        
        // Eğer categories.json yoksa boş bir dosya oluştur
        const categoriesFile = path.join(dataDir, 'categories.json');
        if (!fs.existsSync(categoriesFile)) {
          fs.writeFileSync(categoriesFile, '[]');
          console.log('categories.json dosyası oluşturuldu');
        }
      }

      // Static dosyaları handle et
      if (pathname.startsWith('/_next/') || pathname.includes('.')) {
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
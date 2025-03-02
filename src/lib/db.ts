import sql from 'mssql'
import fs from 'fs/promises'
import path from 'path'

interface Portion {
  id: string
  name: string
  price: string
  mssqlPortionId: string
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  mssqlProductName: string
  portions: Portion[]
  variations?: Portion[]
  price?: string
}

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json')

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

// Ürünleri dosyadan oku
async function readProducts(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Ürünleri dosyaya kaydet
async function writeProducts(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2))
}

export async function connectToDatabase() {
  try {
    const pool = await sql.connect(config)
    return pool
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error)
    throw error
  }
}

export async function updatePrices() {
  const pool = await connectToDatabase()
  
  try {
    // MSSQL'den fiyatları çek
    const result = await pool.request().query(`
      select ROW_NUMBER() OVER(ORDER BY sm.Name,smc.Name,smi.SubMenuTag,smi.Name,mip.MenuItemPortionId,mip.Id ASC) AS Row#,
        mip.MenuItemPortionId as portion_id,
        mip.Id as prices_id,
        smc.Name as Kategori,
        smi.Name as Ürün,
        mp.Name as Porsiyon,
        mip.Price as Fiyat
      from ScreenMenuItems smi
      join ScreenMenuCategories smc on smc.Id=smi.ScreenMenuCategoryId
      join ScreenMenus sm on sm.Id=smc.ScreenMenuId
      join MenuItems mi on mi.Id=smi.MenuItemId
      join MenuItemPortions mp on mp.MenuItemId=mi.Id
      join MenuItemPrices mip on mip.MenuItemPortionId=mp.Id
      where mip.PriceTag is null
      order by 4,5,6,7,1,2
    `)

    // Mevcut ürünleri oku
    const products = await readProducts()

    // Her ürün için fiyat güncelleme kontrolü yap
    const updatedProducts = products.map((product: Product) => {
      // MSSQL'deki eşleşen ürünü bul
      const mssqlProduct = result.recordset.find(
        r => r['Ürün'].toLowerCase() === product.mssqlProductName?.toLowerCase()
      )

      if (mssqlProduct) {
        // Varyasyonları varsa güncelle
        if (product.variations?.length) {
          product.variations = product.variations.map(variation => {
            // MSSQL'deki eşleşen porsiyonu bul
            const mssqlPortion = result.recordset.find(
              r => r.Porsiyon.toLowerCase() === variation.name.toLowerCase()
            )

            if (mssqlPortion) {
              return {
                ...variation,
                price: mssqlPortion.Fiyat.toString()
              }
            }
            return variation
          })

          // Ana fiyatı ilk varyasyonun fiyatı yap
          if (product.variations[0]) {
            product.price = product.variations[0].price
          }
        } else {
          // Varyasyon yoksa direkt fiyatı güncelle
          product.price = mssqlProduct.Fiyat.toString()
        }
      }
      return product
    })

    // Güncellenmiş ürünleri kaydet
    await writeProducts(updatedProducts)

    return {
      updatedProducts,
      mssqlProducts: result.recordset
    }
  } catch (error) {
    console.error('Fiyat güncelleme hatası:', error)
    throw error
  } finally {
    await pool.close()
  }
} 
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json')

interface Variation {
  id: string
  name: string
  price: string
}

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: string
  image: string
  categoryImage: string
  mssqlProductName: string
  features: Array<{
    id: string
    icon: string
    label: string
    value: string
  }>
  variations?: Variation[]
}

// Ürünleri dosyadan oku
async function readProducts(): Promise<Product[]> {
  try {
    // data klasörünü oluştur
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    
    try {
      const data = await fs.readFile(PRODUCTS_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Ürünleri okuma hatası:', error)
      // Dosya yoksa boş bir dizi oluştur ve kaydet
      await fs.writeFile(PRODUCTS_FILE, '[]')
      return []
    }
  } catch (error) {
    console.error('Ürünleri okuma hatası:', error)
    return []
  }
}

// Ürünleri dosyaya kaydet
async function writeProducts(products: Product[]) {
  try {
    // data klasörünü oluştur
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    
    // Dosyayı geçici olarak kaydet
    const tempFile = `${PRODUCTS_FILE}.tmp`
    await fs.writeFile(tempFile, JSON.stringify(products, null, 2))
    
    // Geçici dosyayı asıl dosyaya taşı (atomik işlem)
    try {
      await fs.rename(tempFile, PRODUCTS_FILE)
    } catch {
      // rename başarısız olursa, kopyala ve sil yöntemini dene
      await fs.copyFile(tempFile, PRODUCTS_FILE)
      await fs.unlink(tempFile)
    }
  } catch (error) {
    console.error('Ürünleri kaydetme hatası:', error)
    throw error
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const products = await readProducts()
    return NextResponse.json(products)
  } catch {
    return NextResponse.json(
      { error: 'Ürünler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST isteği alındı')
    const product = await request.json()
    
    // Yeni ürüne benzersiz bir ID ata
    const newProduct = {
      ...product,
      id: Math.random().toString(36).substr(2, 9),
      variations: product.variations?.map((variation: { name: string; price: string }) => ({
        ...variation,
        id: Math.random().toString(36).substr(2, 9)
      }))
    }
    
    const products = await readProducts()
    products.push(newProduct)
    await writeProducts(products)
    
    console.log('Yeni ürün eklendi:', newProduct)
    return new NextResponse(JSON.stringify(newProduct), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    console.error('POST isteği hatası:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Ürün eklenirken bir hata oluştu' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  }
} 
import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json')

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

// Kategorileri dosyadan oku
async function readCategories(): Promise<Category[]> {
  try {
    // Data klasörünü oluştur
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    } catch (error) {
      console.error('Data klasörü oluşturma hatası:', error)
    }
    
    try {
      const data = await fs.readFile(CATEGORIES_FILE, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Kategorileri okuma hatası:', error)
      // Dosya yoksa boş bir dizi oluştur ve kaydet
      try {
        await fs.writeFile(CATEGORIES_FILE, '[]')
      } catch (writeError) {
        console.error('Boş kategori dosyası oluşturma hatası:', writeError)
      }
      return []
    }
  } catch (error) {
    console.error('Kategorileri okuma hatası:', error)
    return []
  }
}

// Kategorileri dosyaya kaydet
async function writeCategories(categories: Category[]) {
  try {
    // Data klasörünü oluştur
    try {
      await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    } catch (error) {
      console.error('Data klasörü oluşturma hatası:', error)
    }
    
    // Dosyayı geçici olarak kaydet
    const tempFile = `${CATEGORIES_FILE}.tmp`
    await fs.writeFile(tempFile, JSON.stringify(categories, null, 2))
    
    // Geçici dosyayı asıl dosyaya taşı (atomik işlem)
    try {
      await fs.rename(tempFile, CATEGORIES_FILE)
    } catch {
      // rename başarısız olursa, kopyala ve sil yöntemini dene
      await fs.copyFile(tempFile, CATEGORIES_FILE)
      await fs.unlink(tempFile).catch(e => console.error('Geçici dosya silme hatası:', e))
    }
  } catch (error) {
    console.error('Kategorileri kaydetme hatası:', error)
    throw error
  }
}

export async function GET(): Promise<Response> {
  try {
    const categories = await readCategories()
    return Response.json(categories)
  } catch (error) {
    console.error('GET isteği hatası:', error)
    return Response.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const category = await request.json()
    
    if (!category || !category.name || !category.id) {
      return Response.json(
        { error: 'Geçersiz kategori verisi' },
        { status: 400 }
      )
    }
    
    const categories = await readCategories()
    
    // Aynı isimde kategori var mı kontrol et
    if (categories.some(c => c.name === category.name)) {
      return Response.json(
        { error: 'Bu isimde bir kategori zaten mevcut' },
        { status: 400 }
      )
    }
    
    categories.push(category)
    await writeCategories(categories)
    
    return Response.json(category)
  } catch (error) {
    console.error('POST isteği hatası:', error)
    return Response.json(
      { error: 'Kategori eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
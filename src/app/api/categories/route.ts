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
    await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

// Kategorileri dosyaya kaydet
async function writeCategories(categories: Category[]) {
  await fs.mkdir(path.join(process.cwd(), 'data'), { recursive: true })
  await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2))
}

export async function GET(): Promise<Response> {
  try {
    const categories = await readCategories()
    return Response.json(categories)
  } catch {
    return Response.json(
      { error: 'Kategoriler yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const category = await request.json()
    const categories = await readCategories()
    
    categories.push(category)
    await writeCategories(categories)
    
    return Response.json(category)
  } catch {
    return Response.json(
      { error: 'Kategori eklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
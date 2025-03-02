import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

const CATEGORIES_FILE = path.join(process.cwd(), 'data', 'categories.json')

async function readCategories(): Promise<Category[]> {
  try {
    const data = await fs.readFile(CATEGORIES_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const categories = await readCategories()
    const updatedCategories = categories.filter((c: Category) => c.id !== id)
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(updatedCategories, null, 2))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Kategori silinemedi' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop()
    const categories = await readCategories()
    const category = categories.find((c: Category) => c.id === id)
    
    if (!category) {
      return NextResponse.json({ error: 'Kategori bulunamadı' }, { status: 404 })
    }
    
    return NextResponse.json(category)
  } catch {
    return NextResponse.json(
      { error: 'Kategori yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
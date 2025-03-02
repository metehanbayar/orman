import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return Response.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Kategori klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', 'categories')
    await mkdir(uploadDir, { recursive: true })

    // Dosyayı kaydet
    const filePath = path.join(uploadDir, file.name)
    await writeFile(filePath, buffer)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Dosya yükleme hatası:', error)
    return Response.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
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
    const type = formData.get('type') as string || 'dishes' // varsayılan olarak dishes
    
    if (!file) {
      return Response.json(
        { error: 'Dosya bulunamadı' },
        { status: 400 }
      )
    }

    // Dosya tipini kontrol et
    if (!['categories', 'dishes'].includes(type)) {
      return Response.json(
        { error: 'Geçersiz dosya tipi' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload klasörünü oluştur
    const uploadDir = path.join(process.cwd(), 'public', type)
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error(`${type} klasörü oluşturma hatası:`, error)
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now()
    const extension = path.extname(file.name)
    const filename = `${path.basename(file.name, extension)}_${timestamp}${extension}`
    const filePath = path.join(uploadDir, filename)

    try {
      // Dosyayı kaydet
      await writeFile(filePath, buffer)
      console.log(`Dosya başarıyla yüklendi: ${filePath}`)

      return Response.json({ 
        success: true,
        path: `/${type}/${filename}`
      })
    } catch (error) {
      console.error('Dosya yazma hatası:', error)
      return Response.json(
        { error: 'Dosya kaydedilirken bir hata oluştu' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Dosya yükleme hatası:', error)
    return Response.json(
      { error: 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
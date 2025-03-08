import { NextRequest } from 'next/server'
import { writeFile, mkdir, stat } from 'fs/promises'
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

    // Upload dizinini oluştur
    const publicDir = path.join(process.cwd(), 'public')
    const uploadDir = path.join(publicDir, type)
    
    try {
      // Public ve upload dizinlerinin varlığını kontrol et
      try {
        await stat(publicDir)
      } catch {
        await mkdir(publicDir, { recursive: true })
        console.log('Public dizini oluşturuldu:', publicDir)
      }

      try {
        await stat(uploadDir)
      } catch {
        await mkdir(uploadDir, { recursive: true })
        console.log('Upload dizini oluşturuldu:', uploadDir)
      }

      // Benzersiz dosya adı oluştur
      const timestamp = Date.now()
      const extension = path.extname(file.name)
      const filename = `${path.basename(file.name, extension)}_${timestamp}${extension}`
      const filePath = path.join(uploadDir, filename)

      // Dosyayı kaydet
      await writeFile(filePath, buffer)
      console.log('Dosya kaydedildi:', filePath)

      // Dosyanın varlığını kontrol et
      try {
        await stat(filePath)
        console.log('Dosya başarıyla oluşturuldu ve erişilebilir')

        // URL'i oluştur
        const fileUrl = `/${type}/${filename}`
        console.log('Dosya URL:', fileUrl)

        return new Response(JSON.stringify({ 
          success: true,
          path: fileUrl,
          timestamp: timestamp
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        })
      } catch (error) {
        console.error('Dosya erişim hatası:', error)
        return Response.json(
          { error: 'Dosya oluşturuldu ama erişilemiyor' },
          { status: 500 }
        )
      }
    } catch (error) {
      console.error('İşlem hatası:', error)
      return Response.json(
        { error: 'Dosya işleme hatası' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Genel hata:', error)
    return Response.json(
      { error: 'Beklenmeyen bir hata oluştu' },
      { status: 500 }
    )
  }
} 
import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import fs from 'fs'

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
    const type = formData.get('type') as string || 'dishes'
    
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
      // Public ve upload dizinlerinin varlığını kontrol et ve oluştur
      if (!fs.existsSync(publicDir)) {
        await mkdir(publicDir, { recursive: true, mode: 0o777 })
        console.log('Public dizini oluşturuldu:', publicDir)
      }

      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true, mode: 0o777 })
        console.log('Upload dizini oluşturuldu:', uploadDir)
      }

      // Benzersiz dosya adı oluştur
      const timestamp = Date.now()
      const extension = path.extname(file.name).toLowerCase()
      const sanitizedName = path.basename(file.name, extension)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
      const filename = `${sanitizedName}-${timestamp}${extension}`
      const filePath = path.join(uploadDir, filename)

      // Dosyayı kaydet
      await writeFile(filePath, buffer)
      await fs.promises.chmod(filePath, 0o666)
      console.log('Dosya kaydedildi:', filePath)

      // Dosyanın erişilebilir olduğunu kontrol et
      await fs.promises.access(filePath, fs.constants.R_OK)

      // URL'i oluştur
      const fileUrl = `/public/${type}/${filename}`
      console.log('Dosya URL:', fileUrl)

      // Dosya boyutunu al
      const stats = await fs.promises.stat(filePath)
      const fileSize = stats.size

      return new Response(JSON.stringify({ 
        success: true,
        path: fileUrl,
        timestamp: timestamp,
        size: fileSize,
        filename: filename,
        fullPath: filePath
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    } catch (error) {
      console.error('İşlem hatası:', error)
      return Response.json(
        { error: 'Dosya işleme hatası: ' + (error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Genel hata:', error)
    return Response.json(
      { error: 'Beklenmeyen bir hata oluştu: ' + (error as Error).message },
      { status: 500 }
    )
  }
} 
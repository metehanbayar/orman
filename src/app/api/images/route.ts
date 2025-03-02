import { NextRequest } from 'next/server'
import fs from 'fs/promises'
import fsSync from 'fs'
import path from 'path'
import https from 'https'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

export async function POST(
  request: NextRequest
): Promise<Response> {
  try {
    const { imageUrl, savePath } = await request.json()
    
    if (!imageUrl || !savePath) {
      return Response.json(
        { error: 'imageUrl ve savePath gerekli' },
        { status: 400 }
      )
    }

    // Tam dosya yolunu oluştur
    const fullPath = path.join(process.cwd(), 'public', savePath)
    
    // Klasörü oluştur
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    
    // Resmi indir ve kaydet
    await new Promise((resolve, reject) => {
      https.get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Resim indirilemedi: ${response.statusCode}`))
          return
        }
        
        const fileStream = fsSync.createWriteStream(fullPath)
        response.pipe(fileStream)
        
        fileStream.on('finish', () => {
          fileStream.close()
          resolve(true)
        })
        
        fileStream.on('error', (err: Error) => {
          fs.unlink(fullPath)
          reject(err)
        })
      }).on('error', reject)
    })
    
    return Response.json(
      { success: true, path: savePath },
      { status: 200 }
    )
  } catch (error) {
    console.error('Resim kaydetme hatası:', error)
    return Response.json(
      { error: 'Resim kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 
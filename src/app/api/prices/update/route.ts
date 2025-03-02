import { updatePrices } from '@/lib/db'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

export async function POST(): Promise<Response> {
  try {
    const result = await updatePrices()
    
    return Response.json({
      success: true,
      message: 'Fiyatlar başarıyla güncellendi',
      data: {
        updatedProducts: result.updatedProducts,
        mssqlProductCount: result.mssqlProducts.length
      }
    })
  } catch (error) {
    console.error('Fiyat güncelleme API hatası:', error)
    return Response.json(
      { 
        success: false, 
        error: 'Fiyat güncelleme işlemi başarısız oldu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
} 
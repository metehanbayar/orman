import { NextResponse } from 'next/server'
import sql from 'mssql'
import { Product, Variation } from '@/types'

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER || '',
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

export async function GET() {
  try {
    // MSSQL bağlantısı
    await sql.connect(config)

    // Fiyat sorgusu
    const result = await sql.query(`
      select ROW_NUMBER() OVER(ORDER BY sm.Name,smc.Name,smi.SubMenuTag,smi.Name,mip.MenuItemPortionId,mip.Id ASC) AS Row#,
        mip.MenuItemPortionId as portion_id,
        mip.Id as prices_id,
        smc.Name as Kategori,
        smi.Name as Ürün,
        mp.Name as Porsiyon,
        mip.Price as Fiyat
      from ScreenMenuItems smi
      join ScreenMenuCategories smc on smc.Id=smi.ScreenMenuCategoryId
      join ScreenMenus sm on sm.Id=smc.ScreenMenuId
      join MenuItems mi on mi.Id=smi.MenuItemId
      join MenuItemPortions mp on mp.MenuItemId=mi.Id
      join MenuItemPrices mip on mip.MenuItemPortionId=mp.Id
      where mip.PriceTag is null
      order by 4,5,6,7,1,2
    `)

    // Ürünleri getir
    const productsResponse = await fetch('http://localhost:3000/api/products')
    const products = await productsResponse.json()

    // Fiyatları eşleştir ve güncelle
    for (const row of result.recordset) {
      const matchingProduct = products.find((p: Product) => 
        p.mssqlProductName === row.Ürün && 
        p.variations?.some((v: Variation) => v.name === row.Porsiyon)
      )

      if (matchingProduct) {
        const variation = matchingProduct.variations?.find((v: Variation) => v.name === row.Porsiyon)
        if (variation) {
          variation.price = row.Fiyat.toString()
        }
      }
    }

    // Güncellenmiş ürünleri kaydet
    for (const product of products) {
      await fetch(`http://localhost:3000/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Fiyatlar başarıyla güncellendi',
      updatedProducts: products 
    })

  } catch (error) {
    console.error('Fiyat güncelleme hatası:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Fiyatlar güncellenirken bir hata oluştu' 
    }, { status: 500 })
  }
} 
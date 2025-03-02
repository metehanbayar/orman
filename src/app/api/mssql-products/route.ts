import sql from 'mssql'

// Route segment config
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'
export const preferredRegion = 'auto'

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER || '',
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: false, // Windows için false yapıyoruz
    trustServerCertificate: true,
    enableArithAbort: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
}

export async function GET(): Promise<Response> {
  try {
    // MSSQL bağlantısı
    const pool = await sql.connect(config)
    console.log('MSSQL bağlantısı başarılı')

    // Ürün sorgusu - Her ürün için benzersiz ID oluşturuyoruz
    const result = await pool.request().query(`
      select distinct
        CONCAT(smi.Id, '_', mp.Id, '_', mip.Id) as id, -- Benzersiz ID oluştur
        smi.Name as name,
        smc.Name as category,
        mp.Name as portion,
        mip.Price as price,
        smi.Id as menuItemId,
        mp.Id as portionId,
        mip.Id as priceId
      from ScreenMenuItems smi
      join ScreenMenuCategories smc on smc.Id=smi.ScreenMenuCategoryId
      join ScreenMenus sm on sm.Id=smc.ScreenMenuId
      join MenuItems mi on mi.Id=smi.MenuItemId
      join MenuItemPortions mp on mp.MenuItemId=mi.Id
      join MenuItemPrices mip on mip.MenuItemPortionId=mp.Id
      where mip.PriceTag is null
      order by smc.Name, smi.Name, mp.Name
    `)

    // Bağlantıyı kapat
    await pool.close()

    return Response.json(result.recordset)
  } catch (error) {
    console.error('MSSQL ürünleri getirme hatası:', error)
    return Response.json({ 
      error: 'MSSQL ürünleri yüklenirken bir hata oluştu',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
} 
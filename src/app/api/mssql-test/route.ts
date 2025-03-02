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
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  connectionTimeout: 30000,
  requestTimeout: 30000
}

export async function GET(): Promise<Response> {
  try {
    // Bağlantı bilgilerini kontrol et
    console.log('Bağlantı bilgileri:', {
      user: config.user,
      server: config.server,
      database: config.database
    })

    // MSSQL bağlantısı
    const pool = await sql.connect(config)
    console.log('MSSQL bağlantısı başarılı')

    // Basit bir test sorgusu
    const result = await pool.request().query('SELECT @@version as version')
    
    // Bağlantıyı kapat
    await pool.close()

    return Response.json({ 
      success: true,
      message: 'MSSQL bağlantısı başarılı',
      version: result.recordset[0].version
    })
  } catch (error) {
    console.error('MSSQL test hatası:', error)
    return Response.json({ 
      success: false,
      error: 'MSSQL bağlantısı başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 })
  }
} 
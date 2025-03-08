/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['placehold.co', 'qrmenu.lila.company'],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'qrmenu.lila.company',
        port: '3000',
        pathname: '/**',
      }
    ]
  },
  env: {
    MSSQL_USER: process.env.MSSQL_USER,
    MSSQL_PASSWORD: process.env.MSSQL_PASSWORD,
    MSSQL_SERVER: process.env.MSSQL_SERVER,
    MSSQL_DATABASE: process.env.MSSQL_DATABASE,
  },
  // Statik dosyaların servis edilmesi için
  async rewrites() {
    return [
      {
        source: '/dishes/:path*',
        destination: '/public/dishes/:path*',
      },
      {
        source: '/categories/:path*',
        destination: '/public/categories/:path*',
      }
    ]
  },
  // CORS ve güvenlik başlıkları
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      {
        // Statik dosyalar için cache kontrolü
        source: '/(dishes|categories)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          }
        ],
      }
    ]
  },
  // Statik dosya servisini etkinleştir
  serverRuntimeConfig: {
    staticFolder: '/public',
  },
  publicRuntimeConfig: {
    staticFolder: '/public',
  }
}

module.exports = nextConfig 
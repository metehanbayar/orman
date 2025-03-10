/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['placehold.co', 'qrmenu.lila.company', 'localhost'],
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'qrmenu.lila.company',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
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
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' }
        ],
      },
      {
        source: '/(dishes|categories)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'Last-Modified', value: new Date().toUTCString() }
        ],
      }
    ]
  },
  // Statik dosya servisini etkinleştir
  distDir: '.next',
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Statik dosya servisini yapılandır
  experimental: {
    outputFileTracingRoot: process.cwd(),
    outputFileTracingExcludes: {
      '*': [
        'node_modules/**',
        '.git/**',
      ],
    },
  },
  webpack: (config, { dev, isServer }) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Statik dosya servisini özelleştir
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
    staticFolder: '/public'
  },
  publicRuntimeConfig: {
    staticFolder: '/public'
  }
}

module.exports = nextConfig 
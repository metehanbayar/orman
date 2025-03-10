/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    unoptimized: true,
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
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
        destination: '/public/dishes/:path*'
      },
      {
        source: '/categories/:path*',
        destination: '/public/categories/:path*'
      }
    ]
  },
  // CORS ve güvenlik başlıkları
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ],
      },
      {
        source: '/public/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ],
      },
      {
        source: '/dishes/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
        ],
      },
      {
        source: '/categories/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          }
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
  },
  // Webpack yapılandırması
  webpack: (config) => {
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
  },
  // Statik dosya servisini yapılandır
  async redirects() {
    return [
      {
        source: '/public/:path*',
        destination: '/:path*',
        permanent: true,
      },
    ]
  },
  // Middleware yapılandırması
  middleware: {
    // Statik dosyalar için middleware'i devre dışı bırak
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
  }
}

module.exports = nextConfig 
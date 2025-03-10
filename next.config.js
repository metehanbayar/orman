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
  // Statik dosyaların servis edilmesi için yapılandırma
  // Basitleştirilmiş yapılandırma - çok fazla ara katman olmadan
  async rewrites() {
    return [
      {
        source: '/dishes/:path*',
        destination: '/dishes/:path*'
      },
      {
        source: '/categories/:path*',
        destination: '/categories/:path*'
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
            value: 'no-cache, no-store, max-age=0, must-revalidate'
          }
        ],
      }
    ]
  },
  // Statik dosya servisini etkinleştir
  distDir: '.next',
  // Webpack yapılandırması
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  // Public klasörünü doğrudan statik olarak sun
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname
  },
  publicRuntimeConfig: {
    staticFolder: '/public'
  },
  // Statik dosya servisini yapılandır
  experimental: {
    outputFileTracingRoot: process.cwd(),
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
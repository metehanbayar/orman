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
        destination: 'http://localhost:3000/public/dishes/:path*'
      },
      {
        source: '/categories/:path*',
        destination: 'http://localhost:3000/public/categories/:path*'
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
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
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
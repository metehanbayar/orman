import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // API istekleri için CORS başlıklarını ekle
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin') || '*'
    
    // OPTIONS isteklerini (preflight) ele al
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }

    // GET, POST, PUT, DELETE istekleri için yanıta CORS başlıkları ekle
    const response = NextResponse.next()
    
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
  
  return NextResponse.next()
}

// Middleware'in hangi yollar için çalışacağını belirt
export const config = {
  matcher: [
    '/api/:path*',
  ],
} 
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Eğer API isteği ise CORS başlıkları ekle
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
  
  // Admin sayfaları için yetkilendirme kontrolü
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Login sayfasına erişim kontrol edilmez
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.next()
    }
    
    const authToken = request.cookies.get('auth_token')?.value
    
    // Token yoksa login sayfasına yönlendir
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    try {
      // Token geçerliliğini kontrol et
      const tokenData = JSON.parse(Buffer.from(authToken, 'base64').toString())
      
      // Token süresi dolmuş mu kontrol et
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      // Kullanıcı admin mi kontrol et
      if (tokenData.role !== 'admin') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
    } catch (error) {
      console.error('Token doğrulama hatası:', error)
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// Middleware'in hangi yollar için çalışacağını belirt
export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
  ],
} 
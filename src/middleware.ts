import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Statik dosya yollarını kontrol et
  const { pathname } = request.nextUrl
  
  // Eğer bu bir statik dosya ise (dishes veya categories içindeyse)
  if (pathname.startsWith('/dishes/') || pathname.startsWith('/categories/')) {
    const response = NextResponse.next()
    
    // Önbellek kontrolünü devre dışı bırak
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
    response.headers.delete('Pragma')
    response.headers.delete('Expires')
    
    return response
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dishes/:path*', '/categories/:path*']
} 
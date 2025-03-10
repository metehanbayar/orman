import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basitleştirilmiş middleware - sadece headers
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Tüm önbellek mekanizmalarını devre dışı bırak
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}

export const config = {
  matcher: [
    // Projenin tüm yollarını içerecek şekilde güncellendi
    '/((?!_next/static|favicon.ico).*)',
  ],
} 
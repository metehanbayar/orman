import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Cookie'yi silmek için response oluştur
    const response = NextResponse.json({ success: true });
    
    // auth_token cookie'sini sil
    response.cookies.delete('auth_token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Çıkış işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
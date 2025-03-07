import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// .env dosyasından değerler veya varsayılan değerler kullanılır
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Kahve2024!';
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_kahve_orman_2024';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Basit kimlik doğrulama
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre yanlış' },
        { status: 401 }
      );
    }

    // Başarılı giriş için basit bir token oluşturma
    const tokenData = {
      username,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 saat geçerli
    };

    const token = Buffer.from(JSON.stringify(tokenData)).toString('base64');

    // Cookie oluştur
    const response = NextResponse.json({ success: true });
    
    // Cookie'yi response'a ekle
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 24 * 60 * 60, // 24 saat - saniye olarak
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Giriş işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 
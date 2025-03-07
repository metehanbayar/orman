import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// .env dosyasından değerler veya varsayılan değerler kullanılır
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
// Geçici çözüm: Hem .env'den hem de özel değer
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Lila*172839'; 
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_kahve_orman_2024';

// Debug için değerleri loglama (Güvenli ortamda bu logları kaldırın!)
console.log('Configured username:', ADMIN_USERNAME);
console.log('Configured password length:', ADMIN_PASSWORD?.length || 0);

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    console.log('Login attempt:', { username, passwordLength: password?.length || 0 });

    // ENV ile yüklenmeme durumuna karşı özel kontrol
    if (username === 'admin' && (password === 'Lila*172839' || password === ADMIN_PASSWORD)) {
      console.log('Özel kimlik doğrulama başarılı');
      
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
    }

    // Basit kimlik doğrulama
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      console.log('Authentication failed');
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre yanlış' },
        { status: 401 }
      );
    }

    console.log('Authentication successful');

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
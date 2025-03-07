'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorDetail('');

    try {
      console.log(`Giriş denenecek: ${username}`);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Giriş hatası:', data);
        throw new Error(data.error || 'Giriş başarısız');
      }

      toast.success('Giriş başarılı');
      router.push('/admin');
      router.refresh();
    } catch (error: any) {
      toast.error('Kullanıcı adı veya şifre hatalı');
      console.error('Giriş hatası:', error);
      setErrorDetail(error.message || 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image 
            src="/logo.png" 
            alt="Logo" 
            width={80} 
            height={80} 
            className="rounded-full"
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Girişi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          {errorDetail && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              Hata detayı: {errorDetail}
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <p>Varsayılan bilgiler:</p>
            <ul className="list-disc ml-4">
              <li>Kullanıcı adı: admin</li>
              <li>Şifre: .env dosyasında tanımlanan şifre</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
} 
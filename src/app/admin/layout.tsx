'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout');
      toast.success('Çıkış yapıldı');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Çıkış yaparken bir hata oluştu');
      console.error('Çıkış hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <Link href="/admin" className="text-3xl font-bold text-gray-900">
              Yönetim Paneli
            </Link>
            <nav className="ml-6">
              <ul className="flex space-x-4">
                <li>
                  <Link 
                    href="/admin/menu" 
                    className="text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    Menü
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/categories" 
                    className="text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    Kategoriler
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/admin/prices" 
                    className="text-gray-600 hover:text-gray-900 hover:underline"
                  >
                    Fiyatlar
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {loading ? 'Çıkış Yapılıyor...' : 'Çıkış Yap'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
} 
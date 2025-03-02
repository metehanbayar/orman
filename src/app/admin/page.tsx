import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Yönetim Paneli - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro yönetim paneli',
}

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Yönetim Paneli</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Menü Yönetimi */}
          <Link
            href="/admin/menu"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Menü Yönetimi
              </h3>
              <p className="text-sm text-gray-500">
                Ürünleri ekleyin, düzenleyin veya silin
              </p>
            </div>
          </Link>

          {/* Kategori Yönetimi */}
          <Link
            href="/admin/categories"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Kategori Yönetimi
              </h3>
              <p className="text-sm text-gray-500">
                Menü kategorilerini düzenleyin
              </p>
            </div>
          </Link>

          {/* Fiyat Güncelleme */}
          <Link
            href="/admin/prices"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Fiyat Güncelleme
              </h3>
              <p className="text-sm text-gray-500">
                MSSQL veritabanından fiyatları güncelleyin
              </p>
            </div>
          </Link>

          {/* XML Import */}
          <Link
            href="/admin/import"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                XML Import
              </h3>
              <p className="text-sm text-gray-500">
                WordPress XML dosyasından ürünleri ve resimleri içe aktarın
              </p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
} 
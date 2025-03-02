'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function PricesPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdatePrices = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/prices/update', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error('Fiyat güncelleme işlemi başarısız oldu')
      }

      await response.json()
      toast.success('Fiyatlar başarıyla güncellendi')
    } catch (error) {
      console.error('Fiyat güncelleme hatası:', error)
      toast.error('Fiyat güncelleme işlemi sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Fiyat Güncelleme</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              MSSQL Fiyat Güncelleme
            </h2>
            <p className="text-gray-600">
              Bu işlem, MSSQL veritabanından en güncel fiyatları çekecek ve menüdeki ürünlerin fiyatlarını güncelleyecektir.
            </p>
          </div>

          <button
            onClick={handleUpdatePrices}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Güncelleniyor...' : 'Fiyatları Güncelle'}
          </button>
        </div>
      </main>
    </div>
  )
} 
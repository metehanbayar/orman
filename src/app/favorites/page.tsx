'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Tüm ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Ürünler yüklenirken bir hata oluştu')
        
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Ürünleri getirme hatası:', error)
        setError(error instanceof Error ? error.message : 'Bir hata oluştu')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Favorileri localStorage'dan al ve ürünlerle eşleştir
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]') as string[]
    const favProducts = products.filter(product => favorites.includes(product.id))
    setFavoriteProducts(favProducts)
  }, [products])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-gray-50/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 border-b border-pink-100">
            <Link 
              href="/" 
              className="text-xl sm:text-2xl font-bold text-[#b60575] hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b60575] to-pink-400">
                Kahve Orman Coffee & Bistro
              </span>
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 text-sm rounded-xl bg-white text-[#b60575] border border-pink-200 hover:bg-pink-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">Menüye Dön</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl shadow-pink-100/20 overflow-hidden">
            <div className="p-6 border-b border-pink-100">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#b60575]">
                  Favori Ürünlerim
                </h1>
                <span className="px-3 py-1 bg-pink-50 text-[#b60575] text-sm font-medium rounded-lg">
                  {favoriteProducts.length} ürün
                </span>
              </div>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 border-4 border-pink-200 border-t-[#b60575] rounded-full animate-spin"></div>
                  <p className="mt-4 text-[#b60575] font-medium">Yükleniyor...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 text-red-500 mb-4">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-red-500 font-medium mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#b60575] text-white rounded-xl hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200/20"
                  >
                    Tekrar Dene
                  </button>
                </div>
              ) : favoriteProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 text-gray-400 mb-4">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium mb-4">Henüz favori ürününüz yok</p>
                  <Link
                    href="/"
                    className="px-6 py-2 bg-[#b60575] text-white rounded-xl hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200/20"
                  >
                    Menüye Göz At
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {favoriteProducts.map((product) => (
                    <div 
                      key={product.id}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <ProductCard 
                        product={product} 
                        allProducts={products}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Kahve Orman Coffee & Bistro. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
} 
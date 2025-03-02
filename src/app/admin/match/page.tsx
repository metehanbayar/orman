'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { Product } from '@/types'

interface MssqlProduct {
  id: string
  name: string
  category: string
  portion: string
  price: string
}

export default function MatchPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [mssqlProducts, setMssqlProducts] = useState<MssqlProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQueries, setSearchQueries] = useState<{ [key: string]: string }>({})
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Ürünler yüklenirken bir hata oluştu')
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Ürünleri getirme hatası:', error)
        toast.error('Ürünler yüklenirken bir hata oluştu')
      }
    }

    const fetchMssqlProducts = async () => {
      try {
        const response = await fetch('/api/mssql-products')
        if (!response.ok) throw new Error('MSSQL ürünleri yüklenirken bir hata oluştu')
        const data = await response.json()
        setMssqlProducts(data)
      } catch (error) {
        console.error('MSSQL ürünleri getirme hatası:', error)
        toast.error('MSSQL ürünleri yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
    fetchMssqlProducts()
  }, [])

  // Ürün eşleştirme
  const handleMatch = async (productId: string, mssqlProduct: MssqlProduct) => {
    try {
      const product = products.find(p => p.id === productId)
      if (!product) return

      const updatedProduct = {
        ...product,
        mssqlProductName: mssqlProduct.name
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      })

      if (!response.ok) throw new Error('Ürün eşleştirme hatası')

      setProducts(products.map(p => 
        p.id === productId ? updatedProduct : p
      ))

      // Arama sorgusunu ve dropdown'ı sıfırla
      setSearchQueries(prev => ({ ...prev, [productId]: '' }))
      setOpenDropdown(null)

      toast.success('Ürün başarıyla eşleştirildi')
    } catch (error) {
      console.error('Ürün eşleştirme hatası:', error)
      toast.error('Ürün eşleştirilirken bir hata oluştu')
    }
  }

  // Filtrelenmiş MSSQL ürünleri
  const getFilteredMssqlProducts = (productId: string) => {
    const query = searchQueries[productId]?.toLowerCase() || ''
    return mssqlProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Ürün Eşleştirme</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Geri
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-[#b60575]"></div>
              <p className="mt-2 text-sm text-gray-500">Yükleniyor...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ürün
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MSSQL Eşleştirme
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 relative">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={searchQueries[product.id] || ''}
                              onChange={(e) => {
                                setSearchQueries(prev => ({
                                  ...prev,
                                  [product.id]: e.target.value
                                }))
                                setOpenDropdown(product.id)
                              }}
                              onFocus={() => setOpenDropdown(product.id)}
                              placeholder={product.mssqlProductName || 'MSSQL ürün ara...'}
                              className={`w-full px-3 py-2 border rounded-md text-sm ${
                                product.mssqlProductName
                                  ? 'border-green-300 bg-green-50 text-green-700 placeholder-green-500'
                                  : 'border-gray-300'
                              }`}
                            />
                            {product.mssqlProductName && (
                              <button
                                onClick={() => handleMatch(product.id, { 
                                  id: '', 
                                  name: '', 
                                  category: '', 
                                  portion: '', 
                                  price: '' 
                                })}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                                title="Eşleştirmeyi kaldır"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Dropdown */}
                          {openDropdown === product.id && (
                            <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
                              {getFilteredMssqlProducts(product.id).map((mssqlProduct) => (
                                <div
                                  key={mssqlProduct.id}
                                  onClick={() => handleMatch(product.id, mssqlProduct)}
                                  className="px-4 py-2 hover:bg-pink-50 cursor-pointer"
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {mssqlProduct.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {mssqlProduct.category} • {mssqlProduct.portion} • {mssqlProduct.price} ₺
                                  </div>
                                </div>
                              ))}

                              {getFilteredMssqlProducts(product.id).length === 0 && (
                                <div className="px-4 py-2 text-sm text-gray-500">
                                  Sonuç bulunamadı
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 
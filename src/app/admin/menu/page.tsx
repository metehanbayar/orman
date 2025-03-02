'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

interface Feature {
  name: string
  value: string
}

interface Variation {
  id: string
  name: string
  price: string
}

interface Product {
  id: string
  name: string
  description: string
  price: string
  category: string
  image: string
  categoryImage: string
  features: Feature[]
  mssqlProductName: string
  variations?: Variation[]
}

const FEATURE_ICONS = [
  { icon: '🌶️', label: 'Acı Seviyesi', values: ['Az Acılı', 'Orta Acılı', 'Çok Acılı'] },
  { icon: '⚖️', label: 'Porsiyon', values: ['Küçük', 'Normal', 'Büyük'] },
  { icon: '🥩', label: 'Pişirme', values: ['Az', 'Orta', 'İyi'] },
  { icon: '🌱', label: 'Diyet', values: ['Vejetaryen', 'Vegan', 'Glutensiz'] },
  { icon: '🥄', label: 'Servis', values: ['1 Kişilik', '2 Kişilik', '4 Kişilik'] },
  { icon: '🔥', label: 'Kalori', values: ['300-400', '400-600', '600+'] },
  { icon: '⭐', label: 'Özellik', values: ['Şefin Önerisi', 'Yeni', 'Popüler'] },
  { icon: '🥜', label: 'Alerjen', values: ['Gluten', 'Fındık', 'Süt'] },
  { icon: '⏰', label: 'Hazırlama', values: ['10-15 dk', '15-25 dk', '25+ dk'] },
  { icon: '💯', label: 'Beğeni', values: ['Trend', 'En Çok Satan', 'Favori'] },
]

export default function MenuPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('')
  const [bulkPriceIncrease, setBulkPriceIncrease] = useState('')

  // Ürünleri getir
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/products', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (!response.ok) {
          throw new Error('Ürünler yüklenirken bir hata oluştu')
        }
        
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error('Ürünleri getirme hatası:', error)
        setError(error instanceof Error ? error.message : 'Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Kategoriler yüklenirken bir hata oluştu')
        const data = await response.json()
        setCategories(data.map((cat: { name: string }) => cat.name))
      } catch (error) {
        console.error('Kategorileri getirme hatası:', error)
      }
    }
    fetchCategories()
  }, [])

  // Benzersiz kategorileri al
  const uniqueCategories = [...new Set(products.map(product => product.category))]

  // Ürün silme
  const handleDelete = async (productId: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
    
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Ürün silinirken bir hata oluştu')
      }
      
      setProducts(products.filter(p => p.id !== productId))
    } catch (error) {
      console.error('Ürün silme hatası:', error)
      alert('Ürün silinirken bir hata oluştu')
    }
  }

  // Ürün düzenleme
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowEditModal(true)
  }

  // Ürün ekleme
  const handleAdd = async (formData: FormData) => {
    try {
      let imagePath = '/placeholder.jpg'
      
      // Önce resmi yükle
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append('file', selectedImage)
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }
        
        imagePath = `/dishes/${selectedImage.name}`
      }

      const category = formData.get('category')?.toString() || ''
      const name = formData.get('name')?.toString() || ''
      const id = Math.random().toString(36).substr(2, 9)

      // Özellikleri topla
      const features: Feature[] = FEATURE_ICONS
        .map(feature => {
          const value = formData.get(`feature_${feature.label}`)?.toString()
          return value ? { name: feature.icon, value } : null
        })
        .filter((f): f is Feature => f !== null)

      // Porsiyon seçeneklerini topla
      const variations: Variation[] = []
      const formEntries = Array.from(formData.entries())
      
      // Tüm name ve price çiftlerini bul
      const variationPairs = formEntries
        .filter(([key]) => key.startsWith('variation_name_') || key.startsWith('variation_price_'))
        .reduce((acc, [key, value]) => {
          const index = key.split('_').pop()
          if (index) { // index undefined değilse işlem yap
            if (!acc[index]) acc[index] = {}
            if (key.includes('name')) acc[index].name = value.toString()
            if (key.includes('price')) acc[index].price = value.toString()
          }
          return acc
        }, {} as Record<string, { name?: string, price?: string }>)

      // Geçerli varyasyonları ekle
      Object.values(variationPairs).forEach(pair => {
        if (pair.name && pair.price) {
          variations.push({
            id: Math.random().toString(36).substr(2, 9),
            name: pair.name,
            price: pair.price
          })
        }
      })

      // Yeni ürünü oluştur
      const newProduct = {
        id,
        name,
        description: formData.get('description')?.toString() || '',
        price: formData.get('price')?.toString() || '0',
        category,
        image: imagePath,
        categoryImage: `/categories/${category.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`,
        features,
        mssqlProductName: name,
        variations
      } satisfies Product

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct)
      })

      if (!response.ok) {
        throw new Error('Ürün eklenirken bir hata oluştu')
      }

      setProducts(prevProducts => [...prevProducts, newProduct])
      setShowAddModal(false)
      setSelectedImage(null)
      toast.success('Ürün başarıyla eklendi')
    } catch (error) {
      console.error('Ürün ekleme hatası:', error)
      toast.error('Ürün eklenirken bir hata oluştu')
    }
  }

  // Ürün güncelleme
  const handleUpdate = async (formData: FormData) => {
    if (!editingProduct) return;

    try {
      let imagePath = editingProduct.image || '/placeholder.jpg'
      
      // Yeni resim seçildiyse yükle
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append('file', selectedImage)
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }
        
        imagePath = `/dishes/${selectedImage.name}`
      }

      // Özellikleri topla
      const features: Feature[] = FEATURE_ICONS
        .map(feature => {
          const value = formData.get(`feature_${feature.label}`)?.toString()
          return value ? { name: feature.icon, value } : null
        })
        .filter((f): f is Feature => f !== null)

      // Porsiyon seçeneklerini topla
      const variations: Variation[] = []
      const formEntries = Array.from(formData.entries())
      
      // Tüm name ve price çiftlerini bul
      const variationPairs = formEntries
        .filter(([key]) => key.startsWith('variation_name_') || key.startsWith('variation_price_'))
        .reduce((acc, [key, value]) => {
          const index = key.split('_').pop()
          if (index) { // index undefined değilse işlem yap
            if (!acc[index]) acc[index] = {}
            if (key.includes('name')) acc[index].name = value.toString()
            if (key.includes('price')) acc[index].price = value.toString()
          }
          return acc
        }, {} as Record<string, { name?: string, price?: string }>)

      // Geçerli varyasyonları ekle
      Object.values(variationPairs).forEach(pair => {
        if (pair.name && pair.price) {
          variations.push({
            id: Math.random().toString(36).substr(2, 9),
            name: pair.name,
            price: pair.price
          })
        }
      })

      const updatedProduct: Product = {
        ...editingProduct,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: formData.get('price') as string,
        category: formData.get('category') as string,
        image: imagePath,
        features,
        variations: variations.length > 0 ? variations : undefined
      }

      const response = await fetch(`/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct)
      })

      if (!response.ok) {
        throw new Error('Ürün güncellenirken bir hata oluştu')
      }

      setProducts(prevProducts => prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p))
      setShowEditModal(false)
      setEditingProduct(null)
      setSelectedImage(null)
      toast.success('Ürün başarıyla güncellendi')
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error)
      toast.error('Ürün güncellenirken bir hata oluştu')
    }
  }

  // Toplu işlemler
  const handleBulkDelete = async () => {
    if (!confirm(`Seçili ${selectedProducts.size} ürünü silmek istediğinize emin misiniz?`)) return

    try {
      for (const productId of selectedProducts) {
        await fetch(`/api/products/${productId}`, {
          method: 'DELETE'
        })
      }
      
      setProducts(products.filter(p => !selectedProducts.has(p.id)))
      setSelectedProducts(new Set())
      toast.success('Seçili ürünler başarıyla silindi')
    } catch (error) {
      console.error('Toplu silme hatası:', error)
      toast.error('Ürünler silinirken bir hata oluştu')
    }
  }

  const handleBulkCategoryUpdate = async () => {
    if (!bulkCategory) return
    if (!confirm(`Seçili ${selectedProducts.size} ürünün kategorisini "${bulkCategory}" olarak değiştirmek istediğinize emin misiniz?`)) return

    try {
      const updatedProducts = []
      for (const product of products) {
        if (selectedProducts.has(product.id)) {
          const updatedProduct = {
            ...product,
            category: bulkCategory,
            categoryImage: `/categories/${bulkCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`
          }
          
          await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct)
          })
          
          updatedProducts.push(updatedProduct)
        } else {
          updatedProducts.push(product)
        }
      }
      
      setProducts(updatedProducts)
      setSelectedProducts(new Set())
      setBulkCategory('')
      toast.success('Kategoriler başarıyla güncellendi')
    } catch (error) {
      console.error('Toplu kategori güncelleme hatası:', error)
      toast.error('Kategoriler güncellenirken bir hata oluştu')
    }
  }

  const handleBulkPriceUpdate = async () => {
    if (!bulkPriceIncrease) return
    const increase = parseFloat(bulkPriceIncrease)
    if (isNaN(increase)) return
    
    if (!confirm(`Seçili ${selectedProducts.size} ürünün fiyatını %${increase} oranında artırmak istediğinize emin misiniz?`)) return

    try {
      const updatedProducts = []
      for (const product of products) {
        if (selectedProducts.has(product.id)) {
          const currentPrice = parseFloat(product.price)
          const newPrice = (currentPrice * (1 + increase / 100)).toFixed(2)
          
          const updatedProduct = {
            ...product,
            price: newPrice
          }
          
          await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct)
          })
          
          updatedProducts.push(updatedProduct)
        } else {
          updatedProducts.push(product)
        }
      }
      
      setProducts(updatedProducts)
      setSelectedProducts(new Set())
      setBulkPriceIncrease('')
      toast.success('Fiyatlar başarıyla güncellendi')
    } catch (error) {
      console.error('Toplu fiyat güncelleme hatası:', error)
      toast.error('Fiyatlar güncellenirken bir hata oluştu')
    }
  }

  const handleUpdatePrices = async () => {
    try {
      setLoading(true)
      
      // MSSQL'den güncel fiyatları al
      const mssqlResponse = await fetch('/api/mssql-products')
      if (!mssqlResponse.ok) {
        throw new Error('MSSQL ürünleri alınamadı')
      }
      const mssqlProducts = await mssqlResponse.json()
      console.log('MSSQL ürünleri alındı:', mssqlProducts.length)

      // Eşleştirilmiş ürünleri filtrele
      const matchedProducts = products.filter(p => p.mssqlProductName)
      console.log('Eşleştirilmiş ürünler:', matchedProducts.length)
      
      if (matchedProducts.length === 0) {
        toast.error('Eşleştirilmiş ürün bulunamadı')
        return
      }

      // Her eşleştirilmiş ürün için fiyat güncelleme işlemi yap
      let updatedCount = 0
      const updatedProducts = [...products]

      for (const product of matchedProducts) {
        try {
          // MSSQL'den eşleşen ürünleri bul
          const matchingMssqlProducts = mssqlProducts.filter(
            (mp: { name: string }) => mp.name === product.mssqlProductName
          )
          console.log(`${product.name} için eşleşen MSSQL ürünleri:`, matchingMssqlProducts.length)

          if (matchingMssqlProducts.length === 0) continue

          // Ürünü güncelle
          const productIndex = updatedProducts.findIndex(p => p.id === product.id)
          if (productIndex === -1) continue

          const updatedProduct = { ...product }

          // Varyasyonları güncelle
          if (product.variations?.length) {
            let hasUpdates = false
            updatedProduct.variations = product.variations.map(variation => {
              const matchingVariation = matchingMssqlProducts.find(
                (mp: { portion: string }) => mp.portion === variation.name
              )
              
              if (matchingVariation) {
                hasUpdates = true
                return {
                  ...variation,
                  price: matchingVariation.price.toString()
                }
              }
              return variation
            })

            // Ana fiyatı ilk varyasyonun fiyatı yap
            if (hasUpdates && updatedProduct.variations[0]) {
              updatedProduct.price = updatedProduct.variations[0].price
            }
          } else {
            // Varyasyon yoksa direkt fiyatı güncelle
            const matchingProduct = matchingMssqlProducts[0]
            if (matchingProduct) {
              updatedProduct.price = matchingProduct.price.toString()
            }
          }

          // Ürünü API'de güncelle
          const response = await fetch(`/api/products/${product.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedProduct)
          })

          if (response.ok) {
            updatedProducts[productIndex] = updatedProduct
            updatedCount++
            console.log(`${product.name} güncellendi`)
          } else {
            console.error(`${product.name} güncellenemedi:`, await response.text())
          }
        } catch (error) {
          console.error(`${product.name} güncellenirken hata:`, error)
        }
      }

      // 4. State'i güncelle ve sonucu bildir
      setProducts(updatedProducts)
      
      if (updatedCount > 0) {
        toast.success(`${updatedCount} ürünün fiyatı güncellendi`)
      } else {
        toast.error('Hiçbir ürün güncellenemedi')
      }
    } catch (error) {
      console.error('Fiyat güncelleme hatası:', error)
      toast.error('Fiyat güncelleme işlemi başarısız oldu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Menü Yönetimi</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#b60575] text-white px-4 py-2 rounded-md hover:bg-[#8c0459] transition-colors"
              >
                Yeni Ürün Ekle
              </button>
              <button
                onClick={handleUpdatePrices}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Fiyatları Güncelle
              </button>
              <button
                onClick={() => router.push('/admin/match')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Ürün Eşleştirme
              </button>
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Geri
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900"></div>
            <p className="mt-4 text-gray-500">Ürünler yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            {uniqueCategories.map((category) => (
              <div key={category} className="mb-16">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden">
                    <Image
                      src={products.find(p => p.category === category)?.categoryImage || '/placeholder.jpg'}
                      alt={category}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {category}
                  </h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {products
                    .filter(product => product.category === category)
                    .map((product) => (
                      <div key={product.id} className="relative">
                        <div className="absolute top-4 left-4 z-10">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={(e) => {
                              const newSelected = new Set(selectedProducts)
                              if (e.target.checked) {
                                newSelected.add(product.id)
                              } else {
                                newSelected.delete(product.id)
                              }
                              setSelectedProducts(newSelected)
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-[#b60575] focus:ring-pink-500"
                          />
                        </div>
                        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                          <div className="relative h-48 w-full">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 right-4">
                              <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full font-semibold shadow-lg">
                                {product.price} ₺
                              </span>
                            </div>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                              {product.features?.map((feature, index) => (
                                <div
                                  key={feature.name || index}
                                  className="bg-gray-50 rounded-lg p-2 text-center"
                                >
                                  <span className="text-2xl mb-1 block" role="img" aria-label={feature.name}>
                                    {feature.name}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {feature.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(product)}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                              >
                                Düzenle
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Henüz ürün eklenmemiş
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Ürün Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Yeni Ürün Ekle</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAdd(new FormData(e.currentTarget))
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ürün Adı
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Açıklama
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Kategori
                </label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Ürün Görseli
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  className="w-full text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Özellikler
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {FEATURE_ICONS.map((feature) => (
                    <div key={feature.label} className="space-y-2">
                      <label className={`flex items-center gap-2 text-sm font-medium ${feature.label === 'Beğeni' ? 'text-[#b60575]' : 'text-gray-800'}`}>
                        <span>{feature.icon}</span>
                        <span>{feature.label}</span>
                        {feature.label === 'Beğeni' && (
                          <span className="text-xs bg-pink-100 text-[#b60575] px-2 py-0.5 rounded-full">
                            Çok satanlar için &quot;En Çok Satan&quot; seçin
                          </span>
                        )}
                      </label>
                      <select
                        name={`feature_${feature.label}`}
                        className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 ${
                          feature.label === 'Beğeni' 
                            ? 'border-pink-200 bg-pink-50/50 focus:border-[#b60575] focus:ring-pink-200' 
                            : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seçiniz</option>
                        {feature.values.map((value) => (
                          <option 
                            key={value} 
                            value={value}
                            className={value === 'En Çok Satan' ? 'font-medium text-[#b60575]' : ''}
                          >
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">
                  Porsiyon Seçenekleri
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="variation_name_1"
                      placeholder="Porsiyon Adı"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      name="variation_price_1"
                      placeholder="Fiyat"
                      step="0.01"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="variation_name_2"
                      placeholder="Porsiyon Adı"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      name="variation_price_2"
                      placeholder="Fiyat"
                      step="0.01"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      name="variation_name_3"
                      placeholder="Porsiyon Adı"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      name="variation_price_3"
                      placeholder="Fiyat"
                      step="0.01"
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setSelectedImage(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#b60575] rounded-md hover:bg-pink-700"
                >
                  Ekle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ürün Düzenleme Modalı */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 my-8">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <h2 className="text-xl font-semibold mb-4 sticky top-0 bg-white py-2 z-10">Ürün Düzenle</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingProduct.name}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingProduct.description}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      name="price"
                      defaultValue={editingProduct.price}
                      required
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Kategori
                    </label>
                    <select
                      name="category"
                      defaultValue={editingProduct.category}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Mevcut Görsel
                    </label>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                      <Image
                        src={editingProduct.image}
                        alt={editingProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <label className="block text-sm font-medium text-gray-800 mt-4 mb-1">
                      Yeni Görsel Yükle
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                      className="w-full text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Özellikler
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {FEATURE_ICONS.map((feature) => (
                        <div key={feature.label} className="space-y-2">
                          <label className={`flex items-center gap-2 text-sm font-medium ${feature.label === 'Beğeni' ? 'text-[#b60575]' : 'text-gray-800'}`}>
                            <span>{feature.icon}</span>
                            <span>{feature.label}</span>
                            {feature.label === 'Beğeni' && (
                              <span className="text-xs bg-pink-100 text-[#b60575] px-2 py-0.5 rounded-full">
                                Çok satanlar için &quot;En Çok Satan&quot; seçin
                              </span>
                            )}
                          </label>
                          <select
                            name={`feature_${feature.label}`}
                            className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 ${
                              feature.label === 'Beğeni' 
                                ? 'border-pink-200 bg-pink-50/50 focus:border-[#b60575] focus:ring-pink-200' 
                                : 'border-gray-300'
                            }`}
                          >
                            <option value="">Seçiniz</option>
                            {feature.values.map((value) => (
                              <option 
                                key={value} 
                                value={value}
                                className={value === 'En Çok Satan' ? 'font-medium text-[#b60575]' : ''}
                              >
                                {value}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      Porsiyon Seçenekleri
                    </label>
                    <div className="space-y-3">
                      {editingProduct?.variations?.map((variation, index) => (
                        <div key={variation.id} className="flex items-center gap-3">
                          <input
                            type="text"
                            name={`variation_name_${index + 1}`}
                            placeholder="Porsiyon Adı"
                            defaultValue={variation.name}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                          <input
                            type="number"
                            name={`variation_price_${index + 1}`}
                            placeholder="Fiyat"
                            defaultValue={variation.price}
                            step="0.01"
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                          />
                        </div>
                      ))}
                      {/* Yeni varyasyon ekleme butonu */}
                      <button
                        type="button"
                        onClick={() => {
                          const newVariation = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: '',
                            price: ''
                          }
                          setEditingProduct(prev => ({
                            ...prev!,
                            variations: [...(prev?.variations || []), newVariation]
                          }))
                        }}
                        className="mt-2 w-full px-3 py-2 text-sm font-medium text-[#b60575] bg-pink-50 rounded-md hover:bg-pink-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Yeni Porsiyon Ekle
                      </button>
                    </div>
                  </div>
                  {/* MSSQL Ürün Adı */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      MSSQL Ürün Adı
                    </label>
                    <input
                      type="text"
                      name="mssqlProductName"
                      defaultValue={editingProduct?.mssqlProductName || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b60575] text-gray-900"
                      placeholder="MSSQL veritabanındaki ürün adı"
                    />
                    <p className="mt-1 text-sm text-gray-600">
                      Bu alan, MSSQL veritabanındaki ürün adıyla eşleştirme için kullanılacaktır.
                    </p>
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white pt-4 mt-4 border-t">
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setEditingProduct(null);
                        setSelectedImage(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#b60575] rounded-md hover:bg-pink-700"
                    >
                      Kaydet
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Toplu İşlem Araç Çubuğu */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedProducts.size} ürün seçildi
                </span>
                <button
                  onClick={() => setSelectedProducts(new Set())}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Seçimi Temizle
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {showBulkActions ? 'İşlemleri Gizle' : 'İşlemleri Göster'}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Seçilenleri Sil
                </button>
              </div>
            </div>
            
            {showBulkActions && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                  >
                    <option value="">Kategori Seçin</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkCategoryUpdate}
                    disabled={!bulkCategory}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#b60575] rounded-md hover:bg-pink-700 disabled:opacity-50"
                  >
                    Kategori Güncelle
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="number"
                      value={bulkPriceIncrease}
                      onChange={(e) => setBulkPriceIncrease(e.target.value)}
                      placeholder="Artış Oranı (%)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <button
                    onClick={handleBulkPriceUpdate}
                    disabled={!bulkPriceIncrease}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#b60575] rounded-md hover:bg-pink-700 disabled:opacity-50"
                  >
                    Fiyat Güncelle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 
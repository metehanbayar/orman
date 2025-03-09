'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { FEATURE_ICONS } from '@/lib/constants'

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

interface Category {
  id: string
  name: string
  image: string
  description: string
}

export default function MenuPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [variationCount, setVariationCount] = useState(1)
  const [loading, setLoading] = useState(false)
  const [imageVersion, setImageVersion] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // Ürünleri yükle
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (!response.ok) throw new Error('Ürünler yüklenemedi')
      const data = await response.json()
      setProducts(data)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      console.error('Ürün yükleme hatası:', error)
      toast.error('Ürünler yüklenirken bir hata oluştu')
    }
  }

  // Kategorileri yükle
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Kategoriler yüklenemedi')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Kategori yükleme hatası:', error)
      toast.error('Kategoriler yüklenirken bir hata oluştu')
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Resim seçme
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedImage(e.target.files[0])
    }
  }

  // Ürün silme
  const handleDelete = async (id: string) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Ürün silinemedi')

      setProducts(products.filter(p => p.id !== id))
      toast.success('Ürün başarıyla silindi')
    } catch (error) {
      console.error('Silme hatası:', error)
      toast.error('Ürün silinirken bir hata oluştu')
    }
  }

  // Düzenleme modunu aç
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setVariationCount(product.variations?.length || 1)
  }

  // Düzenleme modunu kapat
  const handleCancelEdit = () => {
    setEditingProduct(null)
    setSelectedImage(null)
    setVariationCount(1)
  }

  // Ürün ekleme
  const handleAdd = async (formData: FormData) => {
    try {
      let imagePath = '/placeholder.jpg'
      
      // Önce resmi yükle
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append('file', selectedImage)
        imageFormData.append('type', 'dishes')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData,
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        })

        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }

        const uploadResult = await uploadResponse.json()
        if (!uploadResult.success) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }

        imagePath = `${uploadResult.path}?v=${Date.now()}`
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
          if (index) {
            if (!acc[index]) acc[index] = {}
            if (key.includes('name')) acc[index].name = value.toString()
            if (key.includes('price')) acc[index].price = value.toString()
          }
          return acc
        }, {} as Record<string, { name?: string; price?: string }>)

      // Geçerli çiftleri variations dizisine ekle
      Object.values(variationPairs).forEach(pair => {
        if (pair.name && pair.price) {
          variations.push({
            id: Math.random().toString(36).substr(2, 9),
            name: pair.name,
            price: pair.price
          })
        }
      })

      const newProduct = {
        id,
        name,
        description: formData.get('description')?.toString() || '',
        price: formData.get('price')?.toString() || '',
        category,
        image: imagePath,
        categoryImage: category ? categories.find(c => c.id === category)?.image || '' : '',
        features,
        variations: variations.length > 0 ? variations : undefined,
        mssqlProductName: formData.get('mssqlProductName')?.toString() || ''
      } satisfies Product

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        const responseData = await response.text()
        console.error('API yanıtı başarısız:', responseData)
        throw new Error('Ürün eklenirken bir hata oluştu')
      }

      const savedProduct = await response.json()
      setProducts([...products, savedProduct])
      setImageVersion(prev => prev + 1)
      setRefreshKey(prev => prev + 1)
      toast.success('Ürün başarıyla eklendi')

      // Ürünleri yeniden yükle
      await fetchProducts()

      // Formu sıfırla
      const form = document.querySelector('form')
      if (form) {
        form.reset()
        setSelectedImage(null)
        setVariationCount(1)
      }
    } catch (error) {
      console.error('Ekleme hatası:', error)
      toast.error('Ürün eklenirken bir hata oluştu')
    }
  }

  // Ürün güncelleme
  const handleUpdate = async (formData: FormData) => {
    if (!editingProduct) return

    try {
      let imagePath = editingProduct.image
      
      // Yeni resim seçildiyse yükle
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append('file', selectedImage)
        imageFormData.append('type', 'dishes')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: imageFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }

        const uploadResult = await uploadResponse.json()
        if (!uploadResult.success) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }

        imagePath = uploadResult.path
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
          if (index) {
            if (!acc[index]) acc[index] = {}
            if (key.includes('name')) acc[index].name = value.toString()
            if (key.includes('price')) acc[index].price = value.toString()
          }
          return acc
        }, {} as Record<string, { name?: string; price?: string }>)

      // Geçerli çiftleri variations dizisine ekle
      Object.values(variationPairs).forEach(pair => {
        if (pair.name && pair.price) {
          variations.push({
            id: Math.random().toString(36).substr(2, 9),
            name: pair.name,
            price: pair.price
          })
        }
      })

      const updatedProduct = {
        name: formData.get('name')?.toString(),
        description: formData.get('description')?.toString(),
        price: formData.get('price')?.toString(),
        category: formData.get('category')?.toString(),
        image: imagePath,
        categoryImage: formData.get('category')?.toString() ? categories.find(c => c.id === formData.get('category')?.toString())?.image || '' : '',
        features,
        variations: variations.length > 0 ? variations : undefined,
        mssqlProductName: formData.get('mssqlProductName')?.toString()
      }

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      })

      if (!response.ok) {
        console.error('API yanıtı başarısız:', await response.text())
        toast.error('Ürün yerel olarak güncellendi, ancak sunucuda güncellenemedi. Sayfa yenilendiğinde değişiklikler kaybolabilir.')
      } else {
        toast.success('Ürün başarıyla güncellendi')
      }

      // UI'ı güncelle
      const updatedProductData = await response.json()
      setProducts(prevProducts => prevProducts.map(p => 
        p.id === editingProduct.id ? updatedProductData : p
      ))
      setImageVersion(prev => prev + 1)
      setRefreshKey(prev => prev + 1)

      // Ürünleri yeniden yükle
      await fetchProducts()

      // Düzenleme modunu kapat
      handleCancelEdit()
    } catch (error) {
      console.error('Güncelleme hatası:', error)
      toast.error('Ürün güncellenirken bir hata oluştu')
    }
  }

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      
      if (editingProduct) {
        await handleUpdate(formData)
      } else {
        await handleAdd(formData)
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error)
      toast.error('İşlem sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">
          {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        {/* Ana bilgiler */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Ürün Adı
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={editingProduct?.name}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              name="category"
              id="category"
              required
              defaultValue={editingProduct?.category}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Kategori Seçin</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Fiyat
            </label>
            <input
              type="text"
              name="price"
              id="price"
              required
              defaultValue={editingProduct?.price}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="mssqlProductName" className="block text-sm font-medium text-gray-700">
              MSSQL Ürün Adı
            </label>
            <input
              type="text"
              name="mssqlProductName"
              id="mssqlProductName"
              defaultValue={editingProduct?.mssqlProductName}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Açıklama
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={editingProduct?.description}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Resim yükleme */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Ürün Resmi</label>
          <div className="mt-1 flex items-center space-x-4">
            {(editingProduct?.image || selectedImage) && (
              <div className="relative h-32 w-32">
                <Image
                  src={selectedImage ? URL.createObjectURL(selectedImage) : editingProduct?.image || ''}
                  alt="Ürün resmi"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <input
              type="file"
              onChange={handleImageSelect}
              accept="image/*"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>

        {/* Özellikler */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Özellikler</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_ICONS.map(feature => (
              <div key={feature.label}>
                <label htmlFor={`feature_${feature.label}`} className="block text-sm font-medium text-gray-700">
                  {feature.label}
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                    {feature.icon}
                  </span>
                  <input
                    type="text"
                    name={`feature_${feature.label}`}
                    id={`feature_${feature.label}`}
                    defaultValue={editingProduct?.features.find(f => f.name === feature.icon)?.value}
                    className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Porsiyon seçenekleri */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Porsiyon Seçenekleri</h3>
            <button
              type="button"
              onClick={() => setVariationCount(prev => prev + 1)}
              className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100"
            >
              + Seçenek Ekle
            </button>
          </div>
          
          <div className="space-y-4">
            {Array.from({ length: variationCount }).map((_, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor={`variation_name_${index}`} className="block text-sm font-medium text-gray-700">
                    Porsiyon Adı
                  </label>
                  <input
                    type="text"
                    name={`variation_name_${index}`}
                    id={`variation_name_${index}`}
                    defaultValue={editingProduct?.variations?.[index]?.name}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor={`variation_price_${index}`} className="block text-sm font-medium text-gray-700">
                    Fiyat
                  </label>
                  <input
                    type="text"
                    name={`variation_price_${index}`}
                    id={`variation_price_${index}`}
                    defaultValue={editingProduct?.variations?.[index]?.price}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form butonları */}
        <div className="flex justify-end space-x-3">
          {editingProduct && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              İptal
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? 'İşleniyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </form>

      {/* Ürün listesi */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Ürün Listesi</h2>
        </div>
        <div className="border-t border-gray-200">
          <ul role="list" className="divide-y divide-gray-200">
            {products.map(product => (
              <li key={product.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative h-16 w-16 mr-4">
                      <Image
                        src={`${product.image}?v=${Date.now()}&r=${refreshKey}`}
                        alt={product.name}
                        fill
                        className="object-cover rounded-lg"
                        unoptimized
                        priority
                        key={`${product.id}-${imageVersion}-${refreshKey}`}
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                      <p className="text-sm font-medium text-gray-900">{product.price} TL</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
} 
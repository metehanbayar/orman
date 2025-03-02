'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface Category {
  id: string
  name: string
  image: string
  description: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    image: '',
    description: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Kategorileri getir
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error('Kategoriler yüklenirken bir hata oluştu');
        }
        
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Kategorileri getirme hatası:', error);
        toast.error('Kategoriler yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setNewCategory(prev => ({
        ...prev,
        image: `/categories/${file.name}`
      }))
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Önce resmi yükle
      if (selectedImage) {
        const formData = new FormData()
        formData.append('file', selectedImage)
        formData.append('category', newCategory.name || '')
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!uploadResponse.ok) {
          throw new Error('Resim yüklenirken bir hata oluştu')
        }
      }

      // Sonra kategoriyi kaydet
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newCategory,
          id: Math.random().toString(36).substr(2, 9)
        }),
      })

      if (!response.ok) {
        throw new Error('Kategori eklenirken bir hata oluştu')
      }

      const data = await response.json()
      setCategories([...categories, data])
      setNewCategory({
        name: '',
        image: '',
        description: ''
      })
      setSelectedImage(null)
      toast.success('Kategori başarıyla eklendi')
    } catch (error) {
      console.error('Kategori ekleme hatası:', error)
      toast.error('Kategori eklenirken bir hata oluştu')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Kategori silinirken bir hata oluştu');
      }

      setCategories(categories.filter(category => category.id !== id));
      toast.success('Kategori başarıyla silindi');
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      toast.error('Kategori silinirken bir hata oluştu');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Kategori Yönetimi</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Yeni Kategori Formu */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Yeni Kategori Ekle</h2>
            
            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori Adı
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Açıklama
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori Görseli
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {selectedImage && (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                      <Image
                        src={URL.createObjectURL(selectedImage)}
                        alt="Seçilen görsel"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Kategori Ekle
                </button>
              </div>
            </form>
          </div>

          {/* Mevcut Kategoriler */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Mevcut Kategoriler</h2>
            
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-indigo-600"></div>
                  <p className="mt-2 text-gray-500">Yükleniyor...</p>
                </div>
              ) : (
                <>
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={category.image}
                          alt={category.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-500 truncate">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Henüz kategori eklenmemiş
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
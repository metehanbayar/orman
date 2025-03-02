'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Variation {
  id: string;
  name: string;
  price: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  categoryImage: string;
  imageUrl: string | null;
  features: Array<{
    id: string;
    icon: string;
    label: string;
    value: string;
  }>;
  variations?: Variation[];
}

export default function ImportPage() {
  const router = useRouter()
  const [preview, setPreview] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return
    
    const selectedFile = e.target.files[0]
    console.log('Seçilen dosya:', selectedFile.name)
    
    setError(null)
    setProgress('')
    
    try {
      setProgress('XML dosyası okunuyor...')
      const reader = new FileReader()
      
      reader.onerror = (error) => {
        console.error('Dosya okuma hatası:', error)
        setError('Dosya okunurken bir hata oluştu')
      }
      
      reader.onload = async (event) => {
        try {
          console.log('Dosya başarıyla okundu')
          const xmlContent = event.target?.result as string
          
          setProgress('XML ayrıştırılıyor...')
          const parser = new DOMParser()
          const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')
          
          if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            throw new Error('Geçersiz XML formatı')
          }
          
          const items = xmlDoc.getElementsByTagName('item')
          console.log('Bulunan item sayısı:', items.length)
          
          const products: Product[] = []
          let processedCount = 0
          
          setProgress('Ürünler işleniyor...')
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const postType = item.getElementsByTagName('wp:post_type')[0]?.textContent
            const status = item.getElementsByTagName('wp:status')[0]?.textContent
            
            if (postType === 'appetit_item' && status === 'publish') {
              processedCount++
              setProgress(`${processedCount}/${items.length} ürün işleniyor...`)
              
              const title = item.getElementsByTagName('title')[0]?.textContent || ''
              console.log(`İşlenen ürün (${processedCount}/${items.length}):`, title)
              
              // Meta verileri bul
              const metaNodes = item.getElementsByTagName('wp:postmeta')
              let metaValue = ''
              
              for (let j = 0; j < metaNodes.length; j++) {
                const metaKey = metaNodes[j].getElementsByTagName('wp:meta_key')[0]?.textContent
                if (metaKey === 'appetit_item_meta') {
                  metaValue = metaNodes[j].getElementsByTagName('wp:meta_value')[0]?.textContent || ''
                  break
                }
              }
              
              if (metaValue) {
                try {
                  // Meta değerini temizle
                  const cleanMetaValue = metaValue.replace(/^\[CDATA\[|\]\]$/g, '')
                  
                  // Gerekli değerleri çıkar
                  const nameMatch = cleanMetaValue.match(/item_name_1";s:\d+:"([^"]+)/)
                  const descMatch = cleanMetaValue.match(/item_description_1";s:\d+:"([^"]+)/)
                  const priceMatch = cleanMetaValue.match(/price";s:\d+:"(\d+\.\d+|\d+)"/)
                  
                  // Varyasyonları çıkar
                  const variationsMatch = cleanMetaValue.match(/product_variations";a:\d+:{([^]*)}}/m)
                  const variations: Variation[] = []
                  
                  if (variationsMatch) {
                    const variationContent = variationsMatch[1]
                    const regex = /i:\d+;a:\d+:{([^}]*?)}/g
                    let match

                    while ((match = regex.exec(variationContent)) !== null) {
                      const variationData = match[1]
                      const priceMatch = variationData.match(/price";s:\d+:"(\d+)"/)
                      const nameMatch = variationData.match(/variation_name_1";s:\d+:"([^"]+)"/)
                      const idMatch = variationData.match(/ID";s:\d+:"([^"]+)"/)
                      
                      if (nameMatch && priceMatch) {
                        variations.push({
                          id: idMatch?.[1] || Math.random().toString(36).substr(2, 9),
                          name: nameMatch[1],
                          price: priceMatch[1]
                        })

                        // Her varyasyon eklendiğinde debug log
                        console.log(`Varyasyon eklendi: ${nameMatch[1]} - ${priceMatch[1]}TL`)
                      }
                    }

                    // Tüm varyasyonları debug log
                    console.log('Toplam bulunan varyasyonlar:', variations.length, variations)
                  }
                  
                  if (nameMatch) {
                    const name = nameMatch[1]
                    const description = descMatch ? descMatch[1] : ''
                    const basePrice = variations.length > 0 ? variations[0].price : (priceMatch ? priceMatch[1] : '0')
                    
                    // Tüm kategorileri bul
                    const categoryNodes = item.getElementsByTagName('category')
                    const categories: string[] = []
                    
                    for (let j = 0; j < categoryNodes.length; j++) {
                      const domain = categoryNodes[j].getAttribute('domain')
                      if (domain === 'appetit_items_category') {
                        const categoryName = categoryNodes[j].textContent || 'Genel'
                        categories.push(categoryName)
                      }
                    }
                    
                    // Ana kategoriyi belirle (ilk kategori)
                    const category = categories.length > 0 ? categories[0] : 'Genel'
                    
                    // Resim ID'sini bul
                    const squarePhotoMatch = cleanMetaValue.match(/square_photo";s:\d+:"(\d+)"/)
                    let imageUrl: string | null = null
                    
                    if (squarePhotoMatch) {
                      const photoId = squarePhotoMatch[1]
                      // Tüm item'lar içinde bu ID'ye sahip attachment'ı ara
                      for (let k = 0; k < items.length; k++) {
                        const attachment = items[k]
                        if (attachment.getElementsByTagName('wp:post_type')[0]?.textContent === 'attachment') {
                          const attachmentId = attachment.getElementsByTagName('wp:post_id')[0]?.textContent
                          if (attachmentId === photoId) {
                            imageUrl = attachment.getElementsByTagName('wp:attachment_url')[0]?.textContent || null
                            break
                          }
                        }
                      }
                    }
                    
                    // Dosya yollarını oluştur
                    const categorySlug = category.toLowerCase()
                      .replace(/ğ/g, 'g')
                      .replace(/ü/g, 'u')
                      .replace(/ş/g, 's')
                      .replace(/ı/g, 'i')
                      .replace(/ö/g, 'o')
                      .replace(/ç/g, 'c')
                      .replace(/[^a-z0-9]/g, '-')
                    
                    const imagePath = imageUrl ? `/dishes/${name.toLowerCase()
                      .replace(/ğ/g, 'g')
                      .replace(/ü/g, 'u')
                      .replace(/ş/g, 's')
                      .replace(/ı/g, 'i')
                      .replace(/ö/g, 'o')
                      .replace(/ç/g, 'c')
                      .replace(/[^a-z0-9]/g, '-')}.jpg` : '/placeholder.jpg'
                    
                    const categoryImagePath = `/categories/${categorySlug}.jpg`
                    
                    // Özellikler oluştur
                    const features = []
                    
                    // Kategori özelliği ekle
                    if (categories.length > 1) {
                      features.push({
                        id: Math.random().toString(36).substr(2, 9),
                        icon: '🏷️',
                        label: 'Kategori',
                        value: categories.slice(1).join(', ')
                      })
                    }

                    products.push({
                      id: Math.random().toString(36).substr(2, 9),
                      name,
                      description,
                      price: basePrice,
                      category,
                      image: imagePath,
                      categoryImage: categoryImagePath,
                      imageUrl,
                      features: features.length > 0 ? features : [],
                      variations: variations.length > 0 ? variations : undefined
                    })
                    
                    console.log(`Ürün eklendi: ${name} (${variations.length} varyasyon, ${categories.length} kategori)`)
                  }
                } catch (error) {
                  console.error(`Meta parse hatası:`, error)
                }
              }
            }
          }
          
          console.log('Toplam bulunan ürün sayısı:', products.length)
          setProgress(`${products.length} ürün bulundu`)
          setPreview(products)
          
        } catch (error) {
          console.error('XML işleme hatası:', error)
          setError(error instanceof Error ? error.message : 'XML işlenirken bir hata oluştu')
        }
      }
      
      reader.readAsText(selectedFile)
    } catch (error) {
      console.error('Genel hata:', error)
      setError('XML dosyası işlenirken bir hata oluştu')
    }
  }

  const handleImport = async () => {
    if (!preview.length) return
    
    setLoading(true)
    setError(null)
    setProgress('İçe aktarma başlatılıyor...')
    
    try {
      // Önce benzersiz kategorileri topla
      const uniqueCategories = [...new Set(preview.map(product => product.category))]
      const categories = uniqueCategories.map(categoryName => ({
        id: Math.random().toString(36).substr(2, 9),
        name: categoryName,
        image: preview.find(p => p.category === categoryName)?.categoryImage || '',
        description: `${categoryName} kategorisindeki lezzetli ürünlerimiz`
      }))

      // Kategorileri kaydet
      setProgress('Kategoriler kaydediliyor...')
      for (const category of categories) {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(category)
        })

        if (!response.ok) {
          throw new Error('Kategori eklenirken bir hata oluştu')
        }
      }

      // Önce resimleri indir
      const processedProducts: Omit<Product, 'imageUrl'>[] = []
      for (const product of preview) {
        setProgress(`${product.name} için resimler indiriliyor...`)
        
        // Ürün resmini indir
        if (product.imageUrl) {
          try {
            await fetch('/api/images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: product.imageUrl,
                savePath: product.image
              })
            })
          } catch (error) {
            console.error(`Resim indirme hatası (${product.name}):`, error)
          }
        }
        
        // Kategori resmini indir (eğer daha önce indirilmediyse)
        const categoryProcessed = processedProducts.some(
          p => p.category === product.category
        )
        
        if (!categoryProcessed && product.imageUrl) {
          try {
            await fetch('/api/images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: product.imageUrl,
                savePath: product.categoryImage
              })
            })
          } catch (error) {
            console.error(`Kategori resmi indirme hatası (${product.category}):`, error)
          }
        }
        
        // imageUrl'i kaldır ve ürünü işlenmiş olarak işaretle
        const productWithoutUrl = {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          image: product.image,
          categoryImage: product.categoryImage,
          features: product.features,
          variations: product.variations
        }
        processedProducts.push(productWithoutUrl)
      }
      
      // Ürünleri kaydet
      setProgress('Ürünler kaydediliyor...')
      for (const product of processedProducts) {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(product)
        })
        
        if (!response.ok) {
          throw new Error('Ürün eklenirken bir hata oluştu')
        }
      }
      
      toast.success('İçe aktarma başarıyla tamamlandı')
      // Başarılı olduğunda menü sayfasına yönlendir
      router.push('/admin/menu')
    } catch (error) {
      setError('İçe aktarma sırasında bir hata oluştu')
      console.error('İçe aktarma hatası:', error)
      toast.error('İçe aktarma sırasında bir hata oluştu')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">XML Import</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Geri
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WordPress XML Dosyası
            </label>
            <input
              type="file"
              accept=".xml"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {progress && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-600">{progress}</p>
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">
                İçe Aktarılacak Ürünler ({preview.length})
              </h2>
              
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Porsiyon Seçenekleri
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.price} ₺
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {product.variations?.map(v => (
                            <div key={v.id} className="whitespace-nowrap">
                              {v.name}: {v.price} ₺
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'İçe Aktarılıyor...' : 'İçe Aktar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 
'use client'

import { useState, useEffect, useCallback, useMemo, Dispatch, SetStateAction, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { getRecommendation } from '@/lib/ai'
import { toast } from 'react-hot-toast'
import debounce from 'lodash/debounce'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'
import { motion } from 'framer-motion'

interface Recommendation {
  mainDish: Product
  drink: Product
  dessert: Product
}

interface AiModalProps {
  isOpen: boolean
  onClose: () => void
  preferences: string
  setPreferences: Dispatch<SetStateAction<string>>
  selectedFilters: Set<string>
  setSelectedFilters: Dispatch<SetStateAction<Set<string>>>
  handleGetRecommendation: () => Promise<void>
  handleRandomRecommendation: () => Promise<void>
  isRecommending: boolean
  recommendation: Recommendation | null
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  products: Product[]
  scrollToCategory: (category: string) => void
}

// Lazy load edilecek komponentler
const AiModal = dynamic<AiModalProps>(() => import('@/components/modals/AiModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
      </div>
    </div>
  ),
  ssr: false
})

const SearchModal = dynamic<SearchModalProps>(() => import('@/components/modals/SearchModal'), {
  loading: () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent"></div>
      </div>
    </div>
  ),
  ssr: false
})

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)
  const [preferences, setPreferences] = useState('')
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [isRecommending, setIsRecommending] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set())
  const [showSplash, setShowSplash] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastXRef = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number | undefined>(undefined)

  const defaultImageUrl = "https://placehold.co/600x400/gray/white?text=Görsel+Yok";

  // Ürünleri getir - Optimize edilmiş fetch
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch('/api/products')
        if (!response.ok) throw new Error('Ürünler yüklenirken bir hata oluştu')
        
        const data = await response.json()
        if (isMounted) {
          setProducts(data)
          setIsLoading(false)
        }
      } catch (error) {
        if (isMounted) {
          console.error('Ürünleri getirme hatası:', error)
          setError(error instanceof Error ? error.message : 'Bir hata oluştu')
          setIsLoading(false)
        }
      }
    }

    fetchProducts()
    return () => { isMounted = false }
  }, [])

  // Optimize edilmiş kategoriler
  const categories = useMemo(() => 
    [...new Set(products.map(product => product.category))],
    [products]
  );

  // Optimize edilmiş gruplandırılmış ürünler
  const groupedProducts = useMemo(() => 
    products.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {} as Record<string, Product[]>),
    [products]
  );

  // Optimize edilmiş kaydırma
  const scrollToCategory = useCallback((category: string) => {
    const element = document.getElementById(`category-${category}`)
    if (element) {
      // Üst header'ların toplam yüksekliğini hesapla
      const mainHeader = document.querySelector('header') as HTMLElement
      const categoryBar = document.querySelector('.category-bar') as HTMLElement
      const totalOffset = (mainHeader?.offsetHeight || 0) + (categoryBar?.offsetHeight || 0)

      // Elementin pozisyonunu hesapla ve kaydır
      const elementRect = element.getBoundingClientRect()
      const absoluteElementTop = elementRect.top + window.pageYOffset
      window.scrollTo({
        top: absoluteElementTop - totalOffset,
        behavior: 'smooth'
      })
    }
    setSelectedCategory(category)
  }, [])

  // Optimize edilmiş scroll takibi
  useEffect(() => {
    const handleScroll = debounce(() => {
      const mainHeader = document.querySelector('header') as HTMLElement
      const categoryBar = document.querySelector('.category-bar') as HTMLElement
      const totalOffset = (mainHeader?.offsetHeight || 0) + (categoryBar?.offsetHeight || 0)

      const categories = document.querySelectorAll('[data-category]')
      let currentCategory = ''

      categories.forEach((element) => {
        if (element instanceof HTMLElement) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= totalOffset + 100 && rect.bottom >= totalOffset) {
            currentCategory = element.getAttribute('data-category') || ''
          }
        }
      })

      if (currentCategory && currentCategory !== selectedCategory) {
        setSelectedCategory(currentCategory)
        
        // Kategori butonunu görünür alana kaydır
        const button = document.querySelector(`[data-category-button="${currentCategory}"]`)
        if (button instanceof HTMLElement) {
          button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }
    }, 100)

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [selectedCategory])

  // Optimize edilmiş öneri alma
  const handleGetRecommendation = useCallback(async () => {
    if (!preferences.trim()) return;
    
    try {
      setIsRecommending(true);
      // Önceki öneriyi temizle
      setRecommendation(null);
      
      // Kısa bir gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await getRecommendation(products, preferences);
      setRecommendation(result);
    } catch (error) {
      console.error('Öneri alma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Öneri alınırken bir hata oluştu');
    } finally {
      setIsRecommending(false);
    }
  }, [preferences, products]);

  // Optimize edilmiş rastgele öneri
  const handleRandomRecommendation = useCallback(async () => {
    try {
      setIsRecommending(true);
      // Önceki öneriyi temizle
      setRecommendation(null);
      
      // Kısa bir gecikme ekle
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setPreferences('');
      const result = await getRecommendation(products);
      setRecommendation(result);
    } catch (error) {
      console.error('Öneri alma hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Öneri alınırken bir hata oluştu');
    } finally {
      setIsRecommending(false);
    }
  }, [products]);

  // Splash screen kontrolü
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3500)

    return () => clearTimeout(timer)
  }, [])

  // Mouse ve touch olayları için işleyiciler
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollRef.current) return
    scrollRef.current.style.cursor = 'grabbing'
    scrollRef.current.style.animationPlayState = 'paused'
    scrollRef.current.classList.add('dragging')
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    lastXRef.current = pageX
    lastTimeRef.current = Date.now()
    velocityRef.current = 0

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!scrollRef.current) return
    e.preventDefault()
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX
    const currentTime = Date.now()
    const dt = currentTime - lastTimeRef.current
    const dx = pageX - lastXRef.current
    
    if (dt > 0) {
      velocityRef.current = dx / dt
    }
    
    scrollRef.current.scrollLeft -= dx
    lastXRef.current = pageX
    lastTimeRef.current = currentTime
  }

  const handleDragEnd = () => {
    if (!scrollRef.current) return;
    
    scrollRef.current.style.cursor = 'grab'
    
    // Momentum tabanlı kaydırma
    const startTime = Date.now()
    const startVelocity = velocityRef.current * 100 // Hız çarpanı
    const friction = 0.95 // Sürtünme katsayısı
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const velocity = startVelocity * Math.pow(friction, elapsed / 16)
      
      if (Math.abs(velocity) > 0.1 && scrollRef.current) {
        scrollRef.current.scrollLeft -= velocity
        animationFrameRef.current = requestAnimationFrame(animate)
      } else if (scrollRef.current) {
        // Momentum bittiğinde otomatik kaydırmaya başla
        // Önce mevcut scroll pozisyonunu koru
        const currentScroll = scrollRef.current.scrollLeft
        
        // Animasyonu yeniden başlat
        scrollRef.current.classList.remove('dragging')
        scrollRef.current.style.transition = 'none'
        scrollRef.current.style.animationPlayState = 'running'
        
        // Scroll pozisyonunu geri yükle
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollLeft = currentScroll
          }
        })
      }
    }
    
    if (Math.abs(velocityRef.current) > 0.1) {
      animate()
    } else {
      // Hız çok düşükse direkt otomatik kaydırmaya geç
      scrollRef.current.classList.remove('dragging')
      scrollRef.current.style.transition = 'none'
      scrollRef.current.style.animationPlayState = 'running'
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  if (showSplash) {
    return (
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-[#b60575] via-pink-200 to-white">
        {/* Arka plan efektleri - Optimize edilmiş */}
        <div className="absolute inset-0">
          {/* Ana gradyan daireler - Daha az blur ve opacity */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-to-r from-[#b60575] to-pink-300 rounded-full blur-2xl opacity-20 animate-spin-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-gradient-to-l from-[#b60575] to-pink-400 rounded-full blur-2xl opacity-15 animate-spin-reverse-slow" />
          
          {/* Süs daireleri - Daha basit animasyonlar */}
          <motion.div
            className="absolute top-1/3 right-1/3 w-32 h-32 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full blur-xl opacity-20"
            animate={{
              y: [-20, 20],
              x: [10, -10],
              scale: [0.9, 1.1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/3 left-1/3 w-40 h-40 bg-gradient-to-tr from-purple-400 to-pink-300 rounded-full blur-xl opacity-20"
            animate={{
              y: [20, -20],
              x: [-10, 10],
              scale: [1.1, 0.9],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Işıltılı parçacıklar - Daha az parçacık ve daha basit animasyon */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              x: [0, 100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0,
              ease: "easeInOut"
            }}
            style={{
              left: '10%',
              top: '20%',
            }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.3,
              ease: "easeInOut"
            }}
            style={{
              right: '10%',
              top: '30%',
            }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.6,
              ease: "easeInOut"
            }}
            style={{
              left: '30%',
              bottom: '20%',
            }}
          />
          <motion.div
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.5, 0.5],
              x: [0, -100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0.9,
              ease: "easeInOut"
            }}
            style={{
              right: '30%',
              bottom: '30%',
            }}
          />
        </div>

        {/* Logo container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          {/* Işıltı efekti - Daha hafif */}
          <div className="absolute w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl animate-pulse-slow" />
          
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              duration: 0.8
            }}
            className="relative mb-8"
          >
            <Image
              src="/logo.png"
              alt="Kahve Orman Coffee & Bistro"
              width={200}
              height={200}
              className="relative drop-shadow-xl rounded-full bg-white/10 backdrop-blur-sm p-2"
              priority
            />
          </motion.div>

          {/* Başlık ve alt başlık */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center relative z-10"
          >
            <h1 className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
              Kahve Orman Coffee & Bistro
            </h1>
            <div className="relative">
              <p className="text-xl font-medium text-white/90 mb-2">
                Lezzetli bir deneyime hazırlanın...
              </p>
              <div className="h-0.5 w-32 mx-auto bg-white/30" />
            </div>
          </motion.div>

          {/* Yükleniyor animasyonu - Daha basit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-16 flex items-center gap-3"
          >
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/50 via-white to-gray-50/50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 border-b border-pink-100">
            <div 
              className="text-xl sm:text-2xl font-bold text-[#b60575] hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#b60575] to-pink-400">
                Kahve Orman Coffee & Bistro
              </span>
            </div>
            <nav className="flex items-center gap-3">
              <Link
                href="/favorites"
                className="px-4 py-2 text-sm rounded-xl bg-white text-[#b60575] border border-pink-200 hover:bg-pink-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="hidden sm:inline">Favoriler</span>
              </Link>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="px-4 py-2 text-sm rounded-xl bg-[#b60575] text-white hover:bg-pink-700 transition-colors flex items-center gap-2 shadow-lg shadow-pink-200/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="hidden sm:inline">Ne Yesem?</span>
              </button>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-[#b60575] hover:bg-pink-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Çok Satanlar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md z-40 border-t border-pink-100">
        <div className="max-w-7xl mx-auto">
          <div className="relative py-2">
            {/* Başlık */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#b60575] text-white px-4 py-1.5 rounded-full shadow-lg shadow-pink-500/20 flex items-center gap-1.5 text-sm">
              <span className="font-medium">Çok Satanlar</span>
              <span role="img" aria-label="fire">🔥</span>
            </div>

            {/* Ürünler */}
            <div className="relative overflow-hidden">
              <div className="flex overflow-x-auto no-scrollbar">
                <div 
                  ref={scrollRef}
                  className="flex gap-3 px-4 animate-scroll"
                  style={{ 
                    cursor: 'grab',
                    touchAction: 'pan-x'
                  }}
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {/* Ürünler */}
                  {products.filter(p => p.features.some(f => f.value === 'En Çok Satan')).map((product, index) => (
                    <div 
                      key={`${product.id}-${index}`} 
                      className="flex-none"
                      style={{ userSelect: 'none' }}
                    >
                      <button 
                        className="group"
                        onClick={() => {
                          scrollToCategory(product.category)
                        }}
                      >
                        <div className="bg-gradient-to-br from-pink-50 to-white p-2.5 rounded-xl border border-pink-100 hover:border-[#b60575] transition-all">
                          <div className="flex items-center gap-2.5 min-w-[200px]">
                            {/* Ürün Görseli */}
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm overflow-hidden relative flex-shrink-0">
                              <Image
                                src={product.image || defaultImageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                draggable={false}
                              />
                            </div>
                            
                            {/* Ürün Bilgileri */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#b60575] transition-colors whitespace-normal line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#b60575] font-medium mt-0.5">
                                {product.variations?.length ? 'Çeşitli Fiyatlar' : `${product.price} ₺`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                  {/* Ürünlerin kopyası (sonsuz kaydırma için) */}
                  {products.filter(p => p.features.some(f => f.value === 'En Çok Satan')).map((product, index) => (
                    <div 
                      key={`${product.id}-${index}-copy`} 
                      className="flex-none"
                      style={{ userSelect: 'none' }}
                    >
                      <button 
                        className="group"
                        onClick={() => {
                          scrollToCategory(product.category)
                        }}
                      >
                        <div className="bg-gradient-to-br from-pink-50 to-white p-2.5 rounded-xl border border-pink-100 hover:border-[#b60575] transition-all">
                          <div className="flex items-center gap-2.5 min-w-[200px]">
                            {/* Ürün Görseli */}
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm overflow-hidden relative flex-shrink-0">
                              <Image
                                src={product.image || defaultImageUrl}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                                draggable={false}
                              />
                            </div>
                            
                            {/* Ürün Bilgileri */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#b60575] transition-colors whitespace-normal line-clamp-2">
                                {product.name}
                              </h3>
                              <p className="text-xs text-[#b60575] font-medium mt-0.5">
                                {product.variations?.length ? 'Çeşitli Fiyatlar' : `${product.price} ₺`}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white/95 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Kategori Seçimi */}
      <div className="category-bar fixed top-16 left-0 right-0 bg-white z-40">
        <div className="max-w-7xl mx-auto border-b border-pink-100">
          <div className="flex overflow-x-auto gap-1 py-3 px-4 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                data-category-button={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? 'bg-[#b60575] text-white shadow-md shadow-pink-200/20'
                    : 'text-gray-600 hover:text-[#b60575] hover:bg-pink-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Content */}
      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 border-4 border-pink-200 border-t-[#b60575] rounded-full animate-spin"></div>
                <p className="mt-4 text-[#b60575] font-medium">Menü yükleniyor...</p>
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
            ) : (
              Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <div
                  key={category}
                  data-category={category}
                  id={`category-${category}`}
                  className="bg-white rounded-2xl shadow-xl shadow-pink-100/20 overflow-hidden"
                >
                  <div className="p-6 border-b border-pink-100">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#b60575]">
                        {category}
                      </h2>
                      <span className="px-3 py-1 bg-pink-50 text-[#b60575] text-sm font-medium rounded-lg">
                        {categoryProducts.length} ürün
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {categoryProducts.map((product) => (
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {isAiModalOpen && (
        <AiModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          preferences={preferences}
          setPreferences={setPreferences}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          handleGetRecommendation={handleGetRecommendation}
          handleRandomRecommendation={handleRandomRecommendation}
          isRecommending={isRecommending}
          recommendation={recommendation}
        />
      )}

      {isSearchOpen && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          products={products}
          scrollToCategory={scrollToCategory}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid gap-12 md:grid-cols-3">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#b60575]">İletişim</h3>
              <p className="text-gray-600">
                Adres: Örnek Mahallesi, Örnek Sokak No:1
                <br />
                Tel: (555) 123 45 67
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#b60575]">Çalışma Saatleri</h3>
              <p className="text-gray-600">
                Hafta içi: 09:00 - 22:00
                <br />
                Hafta sonu: 10:00 - 23:00
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#b60575]">Sosyal Medya</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-[#b60575] transition-colors">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#b60575] transition-colors">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-pink-100 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Kahve Orman Coffee & Bistro. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
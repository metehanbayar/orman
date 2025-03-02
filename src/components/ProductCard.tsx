import React, { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Product } from '@/types'

interface ProductCardProps {
  product: Product
  allProducts?: Product[]
  categoryProducts?: Product[]
}

const defaultImageUrl = "https://placehold.co/600x400/gray/white?text=Görsel+Yok"

export default function ProductCard({ product, allProducts = [], categoryProducts = [] }: ProductCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(product);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  // Dokunma ve kaydırma işlemleri için değişkenler
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // Favori durumunu localStorage'dan al
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(product.id));
  }, [product.id]);

  // Favori ekleme/çıkarma işlemi
  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      // Favorilerden çıkar
      const newFavorites = favorites.filter((id: string) => id !== product.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Favorilere ekle
      favorites.push(product.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  // Modal kapandığında ürünü sıfırla ve konumuna scroll yap
  const handleCloseModal = useCallback(() => {
    setIsDetailOpen(false);
    setCurrentProduct(product);

    // Ürünün DOM elementini bul
    const productElement = document.querySelector(`[data-product-id="${currentProduct.id}"]`);
    if (productElement) {
      // Header yüksekliğini hesapla
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 0;
      const categoryBar = document.querySelector('.category-bar');
      const categoryBarHeight = categoryBar ? categoryBar.getBoundingClientRect().height : 0;
      const totalOffset = headerHeight + categoryBarHeight;

      // Ürüne scroll yap
      setTimeout(() => {
        const elementRect = productElement.getBoundingClientRect();
        const absoluteElementTop = elementRect.top + window.pageYOffset;
        window.scrollTo({
          top: absoluteElementTop - totalOffset - 20, // 20px ekstra boşluk
          behavior: 'smooth'
        });
      }, 100); // Animasyonun bitmesini beklemek için küçük bir gecikme
    }
  }, [currentProduct.id, product]);

  // Geri tuşu için event listener
  useEffect(() => {
    const handlePopState = () => {
      if (isDetailOpen) {
        handleCloseModal();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDetailOpen, handleCloseModal]);

  // Modal açıldığında history state'i ekle
  useEffect(() => {
    if (isDetailOpen) {
      window.history.pushState({ modal: 'product-detail' }, '');
    }
  }, [isDetailOpen]);

  // Mevcut ürünün tüm ürünler içindeki indeksini bul
  const productsToUse = categoryProducts.length > 0 ? categoryProducts : allProducts;
  const currentIndex = productsToUse.findIndex(p => p.id === currentProduct.id);
  
  // Önceki ve sonraki ürünleri belirle
  const previousProduct = currentIndex > 0 ? productsToUse[currentIndex - 1] : null;
  const nextProduct = currentIndex < productsToUse.length - 1 ? productsToUse[currentIndex + 1] : null;

  // Navigasyon fonksiyonları
  const goToPrevious = useCallback(() => {
    if (previousProduct) {
      setSlideDirection('right');
      setCurrentProduct(previousProduct);
    }
  }, [previousProduct]);

  const goToNext = useCallback(() => {
    if (nextProduct) {
      setSlideDirection('left');
      setCurrentProduct(nextProduct);
    }
  }, [nextProduct]);

  // Klavye navigasyonu için event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDetailOpen) return;
      
      if (e.key === 'ArrowLeft' && previousProduct) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && nextProduct) {
        goToNext();
      } else if (e.key === 'Escape') {
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, previousProduct, nextProduct, handleCloseModal, goToNext, goToPrevious]);

  // Mouse ile kaydırma
  const handleMouseDown = (e: React.MouseEvent) => {
    // Sadece ana görsel alanında kaydırmaya izin ver
    if (!(e.target as HTMLElement).closest('.aspect-square')) return;
    touchStartX.current = e.clientX;
    touchEndX.current = e.clientX; // Başlangıçta aynı noktada
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.clientX;
  };

  // Dokunma olayları
  const handleTouchStart = (e: React.TouchEvent) => {
    // Sadece ana görsel alanında kaydırmaya izin ver
    if (!(e.target as HTMLElement).closest('.aspect-square')) return;
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Başlangıçta aynı noktada
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === 0) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Eğer başlangıç ve bitiş noktaları aynıysa (sadece tıklama), işlemi iptal et
    if (touchStartX.current === touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }

    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && previousProduct) {
        setSlideDirection('right');
        goToPrevious();
      } else if (swipeDistance < 0 && nextProduct) {
        setSlideDirection('left');
        goToNext();
      }
    }

    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseUp = () => {
    // Eğer başlangıç ve bitiş noktaları aynıysa (sadece tıklama), işlemi iptal et
    if (touchStartX.current === touchEndX.current) {
      touchStartX.current = 0;
      touchEndX.current = 0;
      return;
    }

    if (touchStartX.current === 0) return;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0 && previousProduct) {
        setSlideDirection('right');
        goToPrevious();
      } else if (swipeDistance < 0 && nextProduct) {
        setSlideDirection('left');
        goToNext();
      }
    }
    
    // Reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleMouseLeave = () => {
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Modal açıldığında ipucu göster
  useEffect(() => {
    if (isDetailOpen) {
      setShowSwipeHint(true);
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDetailOpen]);

  // Sayfa kaydırmayı kontrol et
  useEffect(() => {
    if (isDetailOpen) {
      // Modal açıkken kaydırmayı engelle
      document.body.style.overflow = 'hidden';
    } else {
      // Modal kapandığında kaydırmayı geri aç
      document.body.style.overflow = 'unset';
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDetailOpen]);

  return (
    <>
      {/* Kompakt Kart */}
      <div 
        onClick={() => {
          setCurrentProduct(product);
          setIsDetailOpen(true);
        }}
        className="h-full bg-white rounded-xl cursor-pointer transition-all hover:shadow-lg flex flex-col relative"
        data-product-id={product.id}
      >
        {/* Favori Butonu */}
        <button
          onClick={handleFavorite}
          className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all group"
        >
          <svg 
            className={`w-5 h-5 ${isFavorite ? 'text-pink-500 fill-current' : 'text-gray-400 group-hover:text-pink-500'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
        </button>

        <div className="aspect-square relative overflow-hidden rounded-t-xl bg-gradient-to-br from-pink-100/50 to-white">
          <Image
            src={product.image || defaultImageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            priority
          />
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="px-3 pt-2 text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="p-3 pt-1 mt-auto">
            {product.variations?.length ? (
              <span className="block w-full px-2 py-1 bg-[#b60575] text-white text-xs font-medium rounded-lg text-center">
                Çeşitler için tıklayın
              </span>
            ) : (
              <span className="block w-full px-2 py-1 bg-[#b60575] text-white text-xs font-medium rounded-lg text-center">
                {product.price} ₺
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detay Modal */}
      <AnimatePresence mode="wait">
        {isDetailOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={handleCloseModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              ref={modalRef}
              className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col relative cursor-default overflow-hidden" 
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              {/* Kaydırma İpucu */}
              <AnimatePresence>
                {showSwipeHint && (
                  <>
                    {/* Sol Kaydırma İpucu */}
                    {previousProduct && (
                      <motion.div
                        className="absolute left-8 inset-y-0 z-40 pointer-events-none flex items-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        <motion.div
                          className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-full"
                          animate={{ 
                            x: [-20, 0, -20],
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                        >
                          <span role="img" aria-label="swipe left" className="text-3xl transform -rotate-90">👆</span>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* Sağ Kaydırma İpucu */}
                    {nextProduct && (
                      <motion.div
                        className="absolute right-8 inset-y-0 z-40 pointer-events-none flex items-center"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <motion.div
                          className="bg-white/10 backdrop-blur-sm text-white p-4 rounded-full"
                          animate={{ 
                            x: [20, 0, 20],
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 1, 0.5]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                          }}
                        >
                          <span role="img" aria-label="swipe right" className="text-3xl transform rotate-90">👆</span>
                        </motion.div>
                      </motion.div>
                    )}
                  </>
                )}
              </AnimatePresence>

              {/* Favori ve Kapat Butonları */}
              <div className="absolute top-4 left-4 z-30">
                <button
                  onClick={handleFavorite}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all group"
                >
                  <svg 
                    className={`w-5 h-5 ${isFavorite ? 'text-pink-500 fill-current' : 'text-gray-400 group-hover:text-pink-500'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </button>
              </div>

              <div className="absolute top-4 right-4 z-30">
                <button
                  onClick={handleCloseModal}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                >
                  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <motion.div 
                className="grid lg:grid-cols-2 h-full"
                key={currentProduct.id}
                initial={{ 
                  x: slideDirection === 'left' ? 300 : -300,
                  opacity: 0
                }}
                animate={{ 
                  x: 0,
                  opacity: 1
                }}
                exit={{ 
                  x: slideDirection === 'left' ? -300 : 300,
                  opacity: 0
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8
                }}
              >
                {/* Sol Taraf - Görsel */}
                <div className="relative lg:h-full">
                  <div className="aspect-square lg:aspect-auto lg:h-full relative overflow-hidden lg:rounded-l-2xl bg-gradient-to-br from-pink-100/50 to-white">
                    <Image
                      src={currentProduct.image || defaultImageUrl}
                      alt={currentProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>
                </div>

                {/* Sağ Taraf - İçerik */}
                <div className="p-6 lg:p-8 overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {currentProduct.name}
                      </h3>
                      {!currentProduct.variations?.length && (
                        <span className="text-xl font-bold text-[#b60575]">
                          {currentProduct.price} ₺
                        </span>
                      )}
                    </div>

                    {/* Çeşitler ve Fiyatlar - Açıklamadan önce */}
                    {currentProduct.variations && currentProduct.variations.length > 0 && (
                      <div className="pt-4">
                        <h4 className="text-base font-medium text-gray-900 mb-3">Fiyatlar</h4>
                        <div className="grid gap-2">
                          {currentProduct.variations.map((variation) => (
                            <div
                              key={variation.id}
                              className="flex items-center justify-between p-3 rounded-xl bg-pink-50 hover:bg-pink-100 transition-colors"
                            >
                              <span className="text-base font-medium text-gray-900">{variation.name}</span>
                              <span className="text-lg font-bold text-[#b60575]">{variation.price} ₺</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentProduct.description && (
                      <p className="text-gray-600 text-base">
                        {currentProduct.description}
                      </p>
                    )}

                    {/* Özellikler */}
                    {currentProduct.features?.filter(feature => feature.value !== 'En Çok Satan').length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Özellikler</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {currentProduct.features
                            .filter(feature => feature.value !== 'En Çok Satan')
                            .map((feature, index) => (
                            <div
                              key={feature.id || index}
                              className="bg-pink-50 rounded-xl p-2 text-center hover:bg-pink-100 transition-colors"
                            >
                              <span className="text-xl block" role="img" aria-label={feature.label}>
                                {feature.icon}
                              </span>
                              <span className="text-xs font-medium text-gray-900">
                                {feature.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ürün Sayacı */}
                    <div className="pt-4 border-t border-gray-100 text-center">
                      <p className="text-xs text-gray-500">
                        {currentIndex + 1} / {productsToUse.length}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {currentProduct.category}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigasyon Butonları - Sabit Pozisyonda */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                {previousProduct && (
                  <button
                    onClick={goToPrevious}
                    className="bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-r-xl shadow-lg hover:bg-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center">
                {nextProduct && (
                  <button
                    onClick={goToNext}
                    className="bg-white/90 backdrop-blur-sm text-gray-800 p-2 rounded-l-xl shadow-lg hover:bg-white transition-all"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 
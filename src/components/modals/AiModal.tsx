import React, { Dispatch, SetStateAction } from 'react'
import { Product } from '@/types'

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

interface FilterButtonProps {
  filter: string
  preference: string
  icon: string
  label: string
  colorClass: string
  selectedFilters: Set<string>
  onClick: (filter: string, preference: string) => void
}

const FilterButton = ({ filter, preference, icon, label, colorClass, selectedFilters, onClick }: FilterButtonProps) => {
  // Her renk sınıfı için özel renkler tanımlayalım
  const getColorClasses = () => {
    const colors = {
      green: {
        active: 'bg-green-600 text-white',
        inactive: 'bg-green-50 text-green-800 hover:bg-green-100 border border-green-200'
      },
      red: {
        active: 'bg-red-600 text-white',
        inactive: 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200'
      },
      orange: {
        active: 'bg-orange-600 text-white',
        inactive: 'bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200'
      },
      blue: {
        active: 'bg-blue-600 text-white',
        inactive: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200'
      },
      gray: {
        active: 'bg-gray-700 text-white',
        inactive: 'bg-gray-50 text-gray-800 hover:bg-gray-100 border border-gray-200'
      },
      yellow: {
        active: 'bg-yellow-600 text-white',
        inactive: 'bg-yellow-50 text-yellow-800 hover:bg-yellow-100 border border-yellow-200'
      }
    }

    return selectedFilters.has(filter) 
      ? colors[colorClass as keyof typeof colors].active 
      : colors[colorClass as keyof typeof colors].inactive
  }

  return (
    <button
      onClick={() => onClick(filter, preference)}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${getColorClasses()} shadow-sm hover:shadow`}
    >
      {icon} {label}
    </button>
  )
}

export default function AiModal({
  isOpen,
  onClose,
  preferences,
  setPreferences,
  selectedFilters,
  setSelectedFilters,
  handleGetRecommendation,
  handleRandomRecommendation,
  isRecommending,
  recommendation
}: AiModalProps) {
  const handleFilterToggle = (filter: string, preference: string) => {
    // Filtre durumunu güncelle
    setSelectedFilters(prev => {
      const newFilters = new Set(prev)
      if (newFilters.has(filter)) {
        newFilters.delete(filter)
        // Tercihi kaldır
        const currentPreferences = preferences.split('. ').filter(p => p.trim())
        const updatedPreferences = currentPreferences.filter(p => !p.includes(preference))
        setPreferences(updatedPreferences.join('. '))
      } else {
        newFilters.add(filter)
        // Tercihi ekle
        const currentPreferences = preferences.split('. ').filter(p => p.trim())
        currentPreferences.push(preference)
        setPreferences(currentPreferences.join('. '))
      }
      return newFilters
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto">
      <div className="relative min-h-screen flex items-start justify-center py-10 px-4 pointer-events-none">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden pointer-events-auto my-auto">
          <div className="max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Size Ne Önerebilirim?
                  </h3>
                  <p className="text-sm text-gray-700">
                    Tercihlerinize göre en uygun menüyü oluşturalım
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Damak Zevkiniz
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton
                      filter="vegetarian"
                      preference="Vejetaryen yemekler tercih ederim"
                      icon="🥬"
                      label="Vejetaryen"
                      colorClass="green"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                    <FilterButton
                      filter="meat"
                      preference="Et yemekleri severim"
                      icon="🥩"
                      label="Et Severim"
                      colorClass="red"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                    <FilterButton
                      filter="spicy"
                      preference="Acılı yemekler severim"
                      icon="🌶️"
                      label="Acılı"
                      colorClass="orange"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                    <FilterButton
                      filter="healthy"
                      preference="Sağlıklı ve hafif yemekler tercih ederim"
                      icon="🥗"
                      label="Sağlıklı"
                      colorClass="blue"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Bütçeniz
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FilterButton
                      filter="economic"
                      preference="Ekonomik fiyatlı ürünler olsun"
                      icon="💰"
                      label="Ekonomik"
                      colorClass="gray"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                    <FilterButton
                      filter="premium"
                      preference="Fiyat önemli değil, en iyi ürünler olsun"
                      icon="⭐"
                      label="Premium"
                      colorClass="yellow"
                      selectedFilters={selectedFilters}
                      onClick={handleFilterToggle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Özel Notlarınız
                  </label>
                  <textarea
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                    placeholder="Örnek: Etli yemekleri severim, acılı olmasın, sağlıklı olsun..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#ef991e] focus:ring-opacity-50 focus:border-transparent text-base text-gray-900 placeholder-gray-500 min-h-[100px] shadow-sm transition-all bg-white hover:bg-gray-50 focus:bg-white"
                  />
                  <p className="mt-2 text-sm text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Yukarıdaki filtreleri kullanabilir veya kendi tercihlerinizi yazabilirsiniz
                  </p>
                </div>

                {/* Reset Filters Button */}
                {selectedFilters.size > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedFilters(new Set())
                        setPreferences('')
                      }}
                      className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Filtreleri Temizle
                    </button>
                  </div>
                )}

                {/* Butonlar */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleGetRecommendation}
                    disabled={isRecommending || !preferences.trim()}
                    className="flex-1 bg-[#ef991e] text-white px-6 py-3 rounded-xl hover:bg-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-200/50 disabled:shadow-none"
                  >
                    {isRecommending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Düşünüyorum...</span>
                      </>
                    ) : (
                      <>
                        <span>Öneri Al</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleRandomRecommendation}
                    disabled={isRecommending}
                    className="px-6 py-3 border-2 border-[#ef991e] text-[#ef991e] rounded-xl hover:bg-pink-50 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Rastgele Seç</span>
                  </button>
                </div>
              </div>
            </div>

            {recommendation && (
              <div className="p-6 bg-gradient-to-b from-pink-50/80 to-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#ef991e] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Size Özel Önerilerim</h4>
                    <p className="text-sm text-gray-700">Tercihlerinize göre seçildi</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Ana Yemek */}
                  <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-xl">
                        🍽️
                      </span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{recommendation.mainDish.name}</h5>
                        <p className="text-sm text-gray-700 line-clamp-1">{recommendation.mainDish.description}</p>
                      </div>
                      <span className="text-[#ef991e] font-semibold whitespace-nowrap text-lg">
                        {recommendation.mainDish.price} ₺
                      </span>
                    </div>
                    {recommendation.mainDish.features?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.mainDish.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors">
                            <span>{feature.icon}</span>
                            <span>{feature.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* İçecek */}
                  <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                        🥤
                      </span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{recommendation.drink.name}</h5>
                        <p className="text-sm text-gray-700 line-clamp-1">{recommendation.drink.description}</p>
                      </div>
                      <span className="text-[#ef991e] font-semibold whitespace-nowrap text-lg">
                        {recommendation.drink.price} ₺
                      </span>
                    </div>
                    {recommendation.drink.features?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.drink.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors">
                            <span>{feature.icon}</span>
                            <span>{feature.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tatlı */}
                  <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center text-xl">
                        🍰
                      </span>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{recommendation.dessert.name}</h5>
                        <p className="text-sm text-gray-700 line-clamp-1">{recommendation.dessert.description}</p>
                      </div>
                      <span className="text-[#ef991e] font-semibold whitespace-nowrap text-lg">
                        {recommendation.dessert.price} ₺
                      </span>
                    </div>
                    {recommendation.dessert.features?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recommendation.dessert.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg text-xs text-gray-700 hover:bg-gray-100 transition-colors">
                            <span>{feature.icon}</span>
                            <span>{feature.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Toplam Tutar */}
                  <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-700 mb-1">Toplam Tutar</p>
                        <p className="text-2xl font-semibold text-[#ef991e]">
                          {(
                            parseFloat(recommendation.mainDish.price) +
                            parseFloat(recommendation.drink.price) +
                            parseFloat(recommendation.dessert.price)
                          ).toFixed(2)} ₺
                        </p>
                      </div>
                      <button
                        onClick={handleRandomRecommendation}
                        className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 border border-gray-200 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Başka Öneri</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
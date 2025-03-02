import React, { Dispatch, SetStateAction } from 'react'
import Image from 'next/image'
import { Product } from '@/types'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  products: Product[]
  scrollToCategory: (category: string) => void
}

const defaultImageUrl = "https://placehold.co/600x400/gray/white?text=Görsel+Yok"

export default function SearchModal({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  products,
  scrollToCategory
}: SearchModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-[#EE9621] focus-within:ring-opacity-50 transition-all">
            <svg className="w-5 h-5 text-[#EE9621]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ne aramıştınız?"
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg text-gray-900 placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          {searchQuery ? (
            <div className="p-2">
              {products
                .filter(product => 
                  product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  product.description.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((product) => (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-pink-50 rounded-xl cursor-pointer transition-all duration-200 group"
                    onClick={() => {
                      scrollToCategory(product.category)
                      onClose()
                      setSearchQuery('')
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                        <Image
                          src={product.image || defaultImageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 group-hover:text-[#EE9621] transition-colors truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">{product.description || product.category}</p>
                        <span className="text-sm font-medium text-[#EE9621] mt-1 block">
                          {product.price} ₺
                        </span>
                      </div>
                      <div className="text-gray-400 group-hover:text-[#EE9621] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              {products.filter(product => 
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Aradığınız ürün bulunamadı</p>
                  <p className="text-sm text-gray-400 mt-1">Farklı bir arama yapmayı deneyin</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500">Ne aramak istersiniz?</p>
              <p className="text-sm text-gray-400 mt-1">Ürün adı veya açıklaması ile arayabilirsiniz</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
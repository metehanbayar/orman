import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fiyat Güncelleme - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro fiyat güncelleme sayfası',
}

export default function PricesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
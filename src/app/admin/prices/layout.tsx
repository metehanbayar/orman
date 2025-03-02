import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fiyat Güncelleme - Kahve Orman',
  description: 'Kahve Orman fiyat güncelleme sayfası',
}

export default function PricesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
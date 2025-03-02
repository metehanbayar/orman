import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favorilerim - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro favori ürünlerim sayfası',
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
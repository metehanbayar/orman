import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favorilerim - Kahve Orman',
  description: 'Kahve Orman favori ürünlerim sayfası',
}

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
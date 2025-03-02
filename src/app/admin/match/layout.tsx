import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ürün Eşleştirme - Kahve Orman',
  description: 'Kahve Orman ürün eşleştirme sayfası',
}

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
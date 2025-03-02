import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ürün Eşleştirme - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro ürün eşleştirme sayfası',
}

export default function MatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
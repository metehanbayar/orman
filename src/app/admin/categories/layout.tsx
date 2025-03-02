import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kategori Yönetimi - Kahve Orman',
  description: 'Kahve Orman kategori yönetimi sayfası',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
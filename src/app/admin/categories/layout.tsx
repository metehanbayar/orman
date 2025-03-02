import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kategori Yönetimi - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro kategori yönetimi sayfası',
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
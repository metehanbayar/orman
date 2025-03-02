import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menü Yönetimi - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro menü yönetimi sayfası',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menü Yönetimi - Kahve Orman',
  description: 'Kahve Orman menü yönetimi sayfası',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
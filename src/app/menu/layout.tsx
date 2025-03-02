import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menü - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro menü sayfası',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
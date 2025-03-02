import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menü - Kahve Orman',
  description: 'Kahve Orman menü sayfası',
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
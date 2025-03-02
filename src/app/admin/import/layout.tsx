import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'XML Import - Kahve Orman Coffee & Bistro',
  description: 'Kahve Orman Coffee & Bistro XML import sayfası',
}

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
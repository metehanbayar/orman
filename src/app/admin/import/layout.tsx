import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'XML Import - Kahve Orman',
  description: 'Kahve Orman XML import sayfası',
}

export default function ImportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 
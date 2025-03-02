export interface Feature {
  id: string
  icon: string
  label: string
  value: string
}

export interface Variation {
  id: string
  name: string
  price: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: string
  category: string
  image: string
  categoryImage: string
  features: Feature[]
  mssqlProductName: string
  variations?: Variation[]
} 
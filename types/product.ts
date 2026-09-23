export interface Product {
  id: string
  documentId: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  discount?: number
  images: string[]
  category: string
  size?: string
  stock: number
  isAvailable: boolean
  isBestSeller?: boolean
  isTrending?: boolean
  isNew?: boolean
  salesCount?: number
  createdAt: string
}

export interface Category {
  id: string
  documentId: string
  name: string
  slug: string
  image: string
  description?: string
}

export interface Order {
  id: string
  customer: {
    name: string
    phone: string
    whatsapp: string
    address: string
    province: string
    notes?: string
  }
  items: {
    productId: string
    productName: string
    quantity: number
    price: number
    image: string
  }[]
  subtotal: number
  shipping: number
  total: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  whatsapp: string
  address: string
  province: string
}

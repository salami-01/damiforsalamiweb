import { supabase } from './supabase'

export type Product = {
  id: string
  name: string
  variant: string
  price: number
  image: string
  stock: number
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error fetching products:', error.message, error.details, error.hint, error.code)
    return []
  }
  return data as Product[]
}
export function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(value)
}
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single()
  if (error) {
    console.error('Error fetching product:', error.message, error.details, error.hint, error.code)
    return null
  }
  return data as Product
}
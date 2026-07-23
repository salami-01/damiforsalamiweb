import { supabase } from './supabase'

export type Product = {
  id: string
  name: string
  variant: string
  price: number
  /** Original price before a promo discount. Null/undefined = not on promo. */
  compareAtPrice: number | null
  /** ISO timestamp for when an active promo ends. Null = no countdown. */
  promoEndsAt: string | null
  image: string
  images: string[]
  stock: number
  category: string | null
  /** Available sizes for this product, e.g. ['XS','S','M']. Empty = single size. */
  sizes: string[]
  /** Freeform tags shown as chips on the product page, e.g. ['Female Gown']. */
  badges: string[]
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error('Error fetching products:', error.message, error.details, error.hint, error.code)
    return []
  }
  return (data ?? []).map(normalizeProduct)
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
  return data ? normalizeProduct(data) : null
}

/**
 * Old rows (or rows inserted before the promo/sizes/badges columns existed)
 * may come back with null arrays — guard against that here so every caller
 * downstream can assume `sizes` and `badges` are always arrays.
 */
function normalizeProduct(row: any): Product {
  return {
    ...row,
    compareAtPrice: row.compareAtPrice ?? null,
    promoEndsAt: row.promoEndsAt ?? null,
    sizes: row.sizes ?? [],
    badges: row.badges ?? [],
  } as Product
}

export type PromoInfo = {
  isPromo: boolean
  percentOff: number
}

/**
 * A product is "on promo" when compareAtPrice > price AND (no deadline set,
 * or the deadline hasn't passed yet). Expiry is a real-time comparison
 * against `at` (defaults to the actual current clock time) — there's no
 * scheduled job flipping anything in the database. Once the deadline
 * passes, this function alone stops reporting the product as a promo
 * everywhere it's called (shop cards, the /promo listing, the product
 * page, the admin preview).
 *
 * Note: the underlying `price` field is untouched by expiry — it's always
 * the actual checkout price regardless of promo display state. If you want
 * the sale price itself to revert to compareAtPrice once the countdown
 * ends, that's a separate, deliberate decision (it changes what customers
 * get charged) — say so and I'll add it rather than assume it.
 */
export function getPromoInfo(product: Product, at: number = Date.now()): PromoInfo {
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price
  const notExpired = !product.promoEndsAt || new Date(product.promoEndsAt).getTime() > at
  const isPromo = hasDiscount && notExpired
  const percentOff = isPromo
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0
  return { isPromo, percentOff }
}
/**
 * The price actually charged at checkout. Currently just `product.price` —
 * expiry of a promo does NOT change what's charged (see getPromoInfo notes).
 * Centralized here so cart/checkout code doesn't reach into `product.price`
 * directly, in case checkout pricing logic (tax, bundles, etc.) changes later.
 */
export function getCheckoutPrice(product: Product): number {
  return product.price
}
export const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const

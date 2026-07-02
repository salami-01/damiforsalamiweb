'use client'

import { useCart } from '@/components/cart-context'
import type { Product } from '@/lib/products'

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart()
  const soldOut = product.stock === 0

  return (
    <div className="mt-8">
      {soldOut ? (
        <div className="mt-8 w-full border border-brand-bone/20 py-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
        Out of Stock
      </div>
      ) : (
        <button
          type="button"
          onClick={() => addItem(product)}
          className="w-full bg-brand-bone py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-brand-black transition-opacity hover:opacity-90"
        >
          Add to cart
        </button>
      )}
    </div>
  )
}
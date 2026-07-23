'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import { useCart } from '@/components/cart-context'
import { useWishlist } from '@/components/wishlist-context'
import type { Product } from '@/lib/products'

export function ProductDetailActions({ product }: { product: Product }) {
  const { addItem } = useCart()
  const { isWishlisted, toggle: toggleWishlist } = useWishlist()
  const router = useRouter()
  const soldOut = product.stock === 0
  const sizes = product.sizes?.length > 0 ? product.sizes : ['One Size']
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null)
  const [quantity, setQuantity] = useState(1)
  const [showSizeWarning, setShowSizeWarning] = useState(false)
  const wishlisted = isWishlisted(product.id)

  if (soldOut) {
    return (
      <div className="mt-8">
        <div className="w-full border border-brand-bone/20 py-4 text-center font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
          Out of Stock
        </div>
        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`mt-4 flex w-full items-center justify-center gap-2 border py-3 font-mono text-[11px] uppercase tracking-[0.3em] transition-colors ${
            wishlisted
              ? 'border-brand-red text-brand-red'
              : 'border-brand-bone/25 text-brand-bone/60 hover:text-brand-red'
          }`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
          {wishlisted ? 'Saved for later' : 'Save for later'}
        </button>
      </div>
    )
  }

  function requireSize() {
    if (!size) {
      setShowSizeWarning(true)
      return false
    }
    return true
  }

  function handleAddToCart() {
    if (!requireSize()) return
    addItem(product, size!, quantity)
  }

  function handleBuyNow() {
    if (!requireSize()) return
    addItem(product, size!, quantity)
    router.push('/checkout')
  }

  return (
    <div className="mt-8">
      <div>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone/50">
          Select size
        </span>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSize(s)
                setShowSizeWarning(false)
              }}
              className={`h-10 min-w-10 border px-3 font-mono text-xs uppercase tracking-wide transition-colors ${
                size === s
                  ? 'border-brand-red bg-brand-red text-brand-bone'
                  : 'border-brand-bone/25 text-brand-bone/70 hover:border-brand-bone/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {showSizeWarning && (
          <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-brand-red">
            Please select a size to continue
          </p>
        )}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center border border-brand-bone/25">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-10 items-center justify-center text-brand-bone/70 transition-colors hover:text-brand-red"
          >
            −
          </button>
          <span className="w-10 text-center font-mono text-sm">{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="flex h-12 w-10 items-center justify-center text-brand-bone/70 transition-colors hover:text-brand-red"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex h-12 flex-1 items-center justify-center gap-2 bg-brand-red font-mono text-[11px] uppercase tracking-[0.3em] text-brand-bone transition-opacity hover:opacity-90"
        >
          Add to cart
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(product)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`flex h-12 w-12 shrink-0 items-center justify-center border transition-colors ${
            wishlisted
              ? 'border-brand-red text-brand-red'
              : 'border-brand-bone/25 text-brand-bone/60 hover:text-brand-red'
          }`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        className="mt-3 w-full border border-brand-bone/40 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-colors duration-300 hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
      >
        Buy Now
      </button>

      <ul className="mt-8 flex flex-col gap-3 border-t border-brand-bone/15 pt-6">
        <li className="flex items-center gap-3 text-xs text-brand-bone/60">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-bone/40" />
          100% Authentic — every item verified before dispatch
        </li>
        <li className="flex items-center gap-3 text-xs text-brand-bone/60">
          <Truck className="h-4 w-4 shrink-0 text-brand-bone/40" />
          Free shipping on orders over ₦50,000
        </li>
        <li className="flex items-center gap-3 text-xs text-brand-bone/60">
          <RotateCcw className="h-4 w-4 shrink-0 text-brand-bone/40" />
          14-day returns — hassle-free
        </li>
      </ul>
    </div>
  )
}

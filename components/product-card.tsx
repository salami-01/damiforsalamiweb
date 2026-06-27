'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { type Product, formatPrice } from '@/lib/products'
import { useCart } from '@/components/cart-context'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { addItem } = useCart()
  const soldOut = product.stock === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col"
    >
      <Link href={`/product/${product.id}`} className="contents">
        <div className="relative overflow-hidden bg-brand-graphite">
          <img
            src={product.image || '/placeholder.svg'}
            alt={`${product.name} in ${product.variant}`}
            className="aspect-[4/5] w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
          {soldOut ? (
            <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/70">
              Sold Out
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addItem(product)
              }}
              className="absolute inset-x-0 bottom-0 translate-y-full bg-brand-bone py-4 font-mono text-[11px] uppercase tracking-[0.3em] text-brand-black opacity-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100"
            >
              Add to cart
            </button>
          )}
        </div>

        <div className="mt-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-brand-bone">{product.name}</h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-bone/45">
              {product.variant}
            </p>
          </div>
          <p className="font-heading text-base font-bold text-brand-red">
            {formatPrice(product.price)}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Minus, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCart } from '@/components/cart-context'
import { formatPrice } from '@/lib/products'

export function CartView() {
  const { items, count, subtotal, removeItem, setQuantity } = useCart()
  const router = useRouter()

  return (
    <main className="min-h-screen bg-brand-slate text-brand-bone">
      <div className="mx-auto max-w-6xl px-6 pb-28 pt-28 md:px-10 md:pt-36">
        <h1 className="font-heading text-5xl font-black uppercase leading-none tracking-tighter sm:text-6xl">
          Your Cart
        </h1>

        {items.length === 0 ? (
          <div className="mt-20 flex flex-col items-start gap-6">
            <p className="text-lg text-brand-bone/70">Your cart is empty.</p>
            <Link
              href="/shop"
              className="inline-flex items-center border border-brand-bone/40 px-8 py-3 font-mono text-xs uppercase tracking-[0.3em] transition-colors duration-500 hover:bg-brand-bone hover:text-brand-black"
            >
              Open Shop
            </Link>
          </div>
        ) : (
          <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12">
            {/* Line items */}
            <ul className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.li
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-5 border-b border-brand-bone/15 py-7 first:border-t"
                  >
                    <div className="h-28 w-24 shrink-0 overflow-hidden bg-brand-graphite">
                      <img
                        src={item.product.image || '/placeholder.svg'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-sm font-medium">{item.product.name}</h2>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-bone/45">
                            {item.product.variant} — Size {item.size}
                          </p>
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-brand-bone/40">
                            {item.product.stock > 0 ? 'In stock' : 'Backorder'}
                          </p>
                        </div>
                        <p className="font-heading text-base font-bold">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center border border-brand-bone/25">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-brand-bone/70 transition-colors hover:text-brand-red"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center font-mono text-sm">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              setQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                            className="flex h-9 w-9 items-center justify-center text-brand-bone/70 transition-colors hover:text-brand-red"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-bone/50 underline-offset-4 transition-colors hover:text-brand-red hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>

            {/* Summary */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-28 border border-brand-bone/15 bg-brand-black/20 p-8">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/60">
                  Cart Summary
                </h2>
                <dl className="mt-8 space-y-4 text-sm">
                  <div className="flex justify-between text-brand-bone/70">
                    <dt>Items ({count})</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-brand-bone/15 pt-4 text-base font-medium text-brand-bone">
                    <dt>Subtotal</dt>
                    <dd className="font-heading font-bold">{formatPrice(subtotal)}</dd>
                  </div>
                </dl>
                <button
                      type="button"
                        onClick={() => router.push('/checkout')}
                        className="mt-8 w-full bg-brand-red py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-opacity duration-300 hover:opacity-90"
                      >
                        Checkout
                    </button>
                    <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-brand-bone/35">
                        Secure payment via Paystack
                    </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}

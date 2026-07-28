'use client'

import { useState, useEffect, useMemo } from 'react'
import { getProducts, getPromoInfo, type Product } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { PromoCountdownBubble } from '@/components/promo-countdown-bubble'
import { SiteFooter } from '@/components/site-footer'

export default function PromoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  // Bumped every 15s purely to force the memos below to re-run — getPromoInfo
  // always checks the real current time itself, this just re-triggers the
  // check so an expired promo drops off the page live instead of needing a
  // refresh to notice the clock ran out.
  const [tick, setTick] = useState(0)

  useEffect(() => {
    getProducts().then((p) => {
      setProducts(p)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000)
    return () => clearInterval(id)
  }, [])

  const promoProducts = useMemo(
    () => products.filter((p) => getPromoInfo(p).isPromo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products, tick],
  )

  // Soonest upcoming deadline across all live promos, if any are timed.
  const nearestDeadline = useMemo(() => {
    const deadlines = promoProducts
      .map((p) => p.promoEndsAt)
      .filter((d): d is string => !!d && new Date(d).getTime() > Date.now())
      .sort()
    return deadlines[0] ?? null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoProducts, tick])

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-12 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-red">
          Limited Time
        </p>
        <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
          Current Promos
        </h1>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-brand-bone/60">
          Marked down for a limited time only. Once the clock runs out, prices return to normal.
        </p>
      </header>

      {loading ? (
        <p className="px-6 pb-28 text-brand-bone/50 md:px-16 lg:px-24">Loading...</p>
      ) : promoProducts.length === 0 ? (
        <p className="px-6 pb-28 text-brand-bone/50 md:px-16 lg:px-24">
          No promos running right now — check back soon.
        </p>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-10 px-6 pb-28 sm:gap-x-6 sm:gap-y-14 md:grid-cols-2 md:px-16 lg:grid-cols-3 lg:px-24">
          {promoProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </section>
      )}

      {nearestDeadline && <PromoCountdownBubble endsAt={nearestDeadline} />}

      <SiteFooter />
    </main>
  )
}
// this is app\promo\page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { getProducts, type Product } from '@/lib/products'
import { getCategories, type Category } from '@/lib/categories'
import { ProductCard } from '@/components/product-card'
import { SiteFooter } from '@/components/site-footer'

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getProducts(), getCategories()]).then(([p, c]) => {
      setProducts(p)
      setCategories(c)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return products
    return products.filter((p) => p.category === filter)
  }, [products, filter])

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-12 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
          The Catalogue
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
            Open Shop
          </h1>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-brand-bone/30 bg-transparent px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-brand-bone outline-none"
          >
            <option value="all" className="bg-brand-graphite">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-brand-graphite">
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-brand-bone/60">
          The complete collection. No filters, no noise — every piece, in order.
        </p>
      </header>

      {loading ? (
        <p className="px-6 pb-28 text-brand-bone/50 md:px-16 lg:px-24">Loading...</p>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-10 px-6 pb-28 sm:gap-x-6 sm:gap-y-14 md:grid-cols-2 md:px-16 lg:grid-cols-3 lg:px-24">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </section>
      )}

      <SiteFooter />
    </main>
  )
}
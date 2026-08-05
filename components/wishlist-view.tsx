'use client'

import Link from 'next/link'
import { useWishlist } from '@/components/wishlist-context'
import { ProductCard } from '@/components/product-card'
import { SiteFooter } from '@/components/site-footer'

export function WishlistView() {
  const { items, loading, user } = useWishlist()

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-graphite px-6 pt-32 text-brand-bone">Loading...</main>
    )
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
        <p>You need to be logged in to view your wishlist.</p>
        <Link href="/login?next=/wishlist" className="mt-4 underline">
          Log in
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-12 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">Saved</p>
        <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
          Your Wishlist
        </h1>
      </header>

      {items.length === 0 ? (
        <p className="px-6 pb-28 text-brand-bone/50 md:px-16 lg:px-24">
          Nothing saved yet — tap the heart on any product to add it here.
        </p>
      ) : (
        <section className="grid grid-cols-2 gap-x-4 gap-y-10 px-6 pb-28 sm:gap-x-6 sm:gap-y-14 md:grid-cols-2 md:px-16 lg:grid-cols-3 lg:px-24">
          {items.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </section>
      )}

      <SiteFooter />
    </main>
  )
}
//this is components\wishlist-view.tsx
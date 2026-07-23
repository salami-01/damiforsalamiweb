import { notFound } from 'next/navigation'
import { getProductById, formatPrice, getPromoInfo, getCheckoutPrice } from '@/lib/products'
import { ProductDetailActions } from '@/components/product-detail-actions'
import { ProductImageCarousel, type CarouselBadge } from '@/components/product-image-carousel'
import { SiteFooter } from '@/components/site-footer'

import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) return { title: 'Product Not Found' }

  const price = getCheckoutPrice(product)

  return {
    title: `${product.name} — ${product.variant}`,
    description: `${product.name} in ${product.variant}, ${formatPrice(price)}.`,
    openGraph: {
      title: `${product.name} — ${product.variant}`,
      description: `${formatPrice(price)} — Salami`,
      images: [{ url: product.image }],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  const { isPromo, percentOff } = getPromoInfo(product)
  const price = getCheckoutPrice(product)
  const soldOut = product.stock === 0

  const imageBadges: CarouselBadge[] = [
    ...(isPromo ? [{ label: 'Sale', tone: 'sale' as const }] : []),
    ...product.badges.map((b) => ({ label: b, tone: 'info' as const })),
  ]

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <section className="grid grid-cols-1 gap-12 px-6 pt-28 md:grid-cols-2 md:px-16 md:pt-36 lg:px-24">
        <ProductImageCarousel
          images={product.images?.length > 0 ? product.images : [product.image]}
          alt={`${product.name} in ${product.variant}`}
          badges={imageBadges}
        />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/15 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-emerald-400">
              ✓ Verified
            </span>
            {product.badges.map((b) => (
              <span
                key={b}
                className="rounded-sm bg-brand-bone/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide text-brand-bone/70"
              >
                {b}
              </span>
            ))}
          </div>

          <h1 className="mt-4 font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
            {product.variant}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <p className="font-heading text-2xl font-bold text-brand-red">
              {formatPrice(price)}
            </p>
            {isPromo && (
              <>
                <p className="font-mono text-sm text-brand-bone/40 line-through">
                  {formatPrice(product.compareAtPrice!)}
                </p>
                <span className="rounded-sm bg-emerald-500 px-2 py-1 font-mono text-[10px] font-bold text-black">
                  -{percentOff}% OFF
                </span>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {product.category && (
              <div className="border border-brand-bone/15 px-3 py-1.5">
                <p className="font-mono text-[9px] uppercase tracking-wide text-brand-bone/40">
                  Category
                </p>
                <p className="font-mono text-xs uppercase text-brand-bone/80">
                  {product.category}
                </p>
              </div>
            )}
            <div className="border border-brand-bone/15 px-3 py-1.5">
              <p className="font-mono text-[9px] uppercase tracking-wide text-brand-bone/40">
                Status
              </p>
              <p className="font-mono text-xs uppercase text-brand-bone/80">
                {soldOut ? 'Sold Out' : 'Active'}
              </p>
            </div>
          </div>

          <ProductDetailActions product={product} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
//app/product/[id]/page.tsx

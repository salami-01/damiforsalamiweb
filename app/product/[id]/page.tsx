import { notFound } from 'next/navigation'
import { getProductById, formatPrice, getPromoInfo } from '@/lib/products'
import { ProductDetailActions } from '@/components/product-detail-actions'
import { ProductImageCarousel } from '@/components/product-image-carousel'
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

  return {
    title: `${product.name} — ${product.variant}`,
    description: `${product.name} in ${product.variant}, ${formatPrice(product.price)}.`,
    openGraph: {
      title: `${product.name} — ${product.variant}`,
      description: `${formatPrice(product.price)} — Salami`,
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

  return (
    <main className="min-h-screen text-brand-bone">
      <section className="grid grid-cols-1 gap-12 px-6 pt-28 md:grid-cols-2 md:px-16 md:pt-36 lg:px-24">
        <ProductImageCarousel
          images={product.images?.length > 0 ? product.images : [product.image]}
          alt={`${product.name} in ${product.variant}`}
        />

        <div className="flex flex-col">
          {isPromo && (
            <span className="mb-3 inline-flex w-fit items-center rounded-full bg-brand-red px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-brand-bone">
              -{percentOff}% off
            </span>
          )}
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
            {product.variant}
          </p>

          {isPromo ? (
            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <p className="font-heading text-2xl font-bold text-brand-red">
                {formatPrice(product.price)}
              </p>
              <p className="font-mono text-base text-brand-bone/40 line-through">
                {formatPrice(product.compareAtPrice!)}
              </p>
            </div>
          ) : (
            <p className="mt-6 font-heading text-2xl font-bold text-brand-red">
              {formatPrice(product.price)}
            </p>
          )}

          {product.badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-brand-bone/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-brand-bone/70"
                >
                  {b}
                </span>
              ))}
            </div>
          )}

          <ProductDetailActions product={product} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
//app/product/[id]/page.tsx
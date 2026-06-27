import { notFound } from 'next/navigation'
import { getProductById, formatPrice } from '@/lib/products'
import { ProductDetailActions } from '@/components/product-detail-actions'
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

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <section className="grid grid-cols-1 gap-12 px-6 pt-28 md:grid-cols-2 md:px-16 md:pt-36 lg:px-24">
        <div className="overflow-hidden bg-brand-graphite">
          <img
            src={product.image || '/placeholder.svg'}
            alt={`${product.name} in ${product.variant}`}
            className="aspect-[4/5] w-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <h1 className="font-heading text-3xl font-black uppercase tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone/50">
            {product.variant}
          </p>
          <p className="mt-6 font-heading text-2xl font-bold text-brand-red">
            {formatPrice(product.price)}
          </p>

          <ProductDetailActions product={product} />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
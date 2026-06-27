import { getProducts } from '@/lib/products'
import { ProductCard } from '@/components/product-card'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Shop',
  description: 'Browse the complete Salami collection — heavyweight cloth, considered cuts, no noise.',
}
export default async function ShopPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-12 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
          The Catalogue
        </p>
        <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl lg:text-8xl">
          Open Shop
        </h1>
        <p className="mt-6 max-w-md text-pretty leading-relaxed text-brand-bone/60">
          The complete collection. No filters, no noise — every piece, in order.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-x-6 gap-y-14 px-6 pb-28 sm:grid-cols-2 md:px-16 lg:grid-cols-3 lg:px-24">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </section>

      <SiteFooter />
    </main>
  )
}
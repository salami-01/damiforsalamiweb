import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'

export const metadata = {
  title: 'Terms & Conditions',
  description: 'Salami shipping, refund, and import duty policies.',
}
const POLICIES = [
  {
    title: 'Refund Policy',
    body: [
      'All sales are final. We do not offer refunds or exchanges on purchased garments once an order has been confirmed.',
      'The sole exceptions are items that become unavailable after purchase, or orders confirmed lost in transit by the carrier. In these cases we will issue a full refund to the original payment method.',
    ],
  },
  {
    title: 'Shipping',
    body: [
      'Orders are processed within three to five business days. Once dispatched, delivery timelines are estimates provided by the carrier and are not guaranteed.',
      'It is the customer\u2019s responsibility to ensure shipping information is accurate at checkout. Salami is not liable for orders delayed or lost due to incorrect addresses.',
    ],
  },
  {
    title: 'Import Duties',
    body: [
      'International orders may be subject to import duties, taxes, and customs fees levied by the destination country.',
      'These charges are the responsibility of the recipient and are not included in the order total. Please consult your local customs office for details.',
    ],
  },
  {
    title: 'Contact',
    body: [
      'Questions regarding these terms may be directed to our team.',
      'Reach us any time at the address listed on our Contact page.',
    ],
    link: { label: 'Visit Contact', href: '/contact' },
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-brand-graphite text-brand-bone">
      <header className="px-6 pb-16 pt-28 md:px-16 md:pt-36 lg:px-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">
          The Fine Print
        </p>
        <h1 className="mt-6 font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter sm:text-7xl">
          Terms &amp;
          <br />
          Conditions
        </h1>
      </header>

      <section className="grid grid-cols-1 gap-x-12 gap-y-14 px-6 pb-28 md:grid-cols-2 md:px-16 lg:px-24">
        {POLICIES.map((policy) => (
          <article key={policy.title}>
            <h2 className="font-heading text-xl font-extrabold uppercase tracking-tight text-brand-bone">
              {policy.title}
            </h2>
            <div className="mt-5 space-y-4">
              {policy.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-xs uppercase leading-relaxed tracking-wider text-brand-bone/55"
                >
                  {paragraph}
                </p>
              ))}
              {policy.link && (
                <Link
                  href={policy.link.href}
                  className="inline-block text-xs uppercase tracking-wider text-brand-red underline underline-offset-4 transition-opacity hover:opacity-80"
                >
                  {policy.link.label}
                </Link>
              )}
            </div>
          </article>
        ))}
      </section>

      <SiteFooter />
    </main>
  )
}

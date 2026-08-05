import Link from 'next/link'
import { fulfillPaystackOrder } from '@/lib/orders/fulfill-paystack-order'

export const dynamic = 'force-dynamic'

function FailureView({ message, reference }: { message: string; reference?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
      <h1 className="font-heading text-4xl font-black uppercase tracking-tighter">Payment Issue</h1>
      <p className="mt-4 text-brand-bone/60">{message}</p>
      {reference && <p className="mt-2 font-mono text-xs text-brand-bone/40">Reference: {reference}</p>}
      <Link
        href="/cart"
        className="mt-10 inline-flex items-center gap-3 border border-brand-bone/40 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
      >
        Back to cart
      </Link>
    </main>
  )
}

export default async function CheckoutCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>
}) {
  const { reference } = await searchParams
  if (!reference) return <FailureView message="Missing payment reference." />

  const result = await fulfillPaystackOrder(reference)

  if (!result.ok) {
    return <FailureView message={result.error} reference={reference} />
  }

  const { order } = result

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-brand-graphite px-6 text-center text-brand-bone">
      <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-brand-bone/50">Thank you</p>
      <h1 className="mt-6 font-heading text-5xl font-black uppercase tracking-tighter sm:text-7xl">Order Confirmed</h1>
      <p className="mt-4 text-brand-bone/60">Order {order.id} — a confirmation email is on its way.</p>
      <Link
        href="/account"
        className="mt-10 inline-flex items-center gap-3 border border-brand-bone/40 px-8 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
      >
        View order history
      </Link>
    </main>
  )
}
//app/checkout/callback/page.tsx
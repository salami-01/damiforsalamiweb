import Link from 'next/link'
import { verifyTransaction } from '@/lib/paystack'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/products'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err: any) {
    return <FailureView message={err.message || 'Could not verify payment.'} />
  }

  const admin = createAdminClient()

  const metadataForLog = verification.metadata as any

  await admin.from('payments').upsert(
    {
      reference,
      user_id: metadataForLog?.user_id ?? null,
      email: verification.customer?.email ?? '',
      amount: verification.amount,
      status: verification.status,
      channel: verification.channel ?? null,
      raw_response: verification,
    },
    { onConflict: 'reference' },
  )

  if (verification.status !== 'success') {
    return <FailureView message="Payment was not successful." reference={reference} />
  }

  const { data: existing } = await admin
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .maybeSingle()

  let order = existing

  if (!order) {
    const metadata = verification.metadata as any
    const items = metadata.items as Array<{
      product_id: string
      name: string
      variant: string
      size: string
      quantity: number
      price: number
    }>

    const orderId = `SM-${Date.now().toString().slice(-6)}`
    const total = verification.amount / 100

    const { data: inserted, error: insertError } = await admin
      .from('orders')
      .insert({
        id: orderId,
        user_id: metadata.user_id,
        customer: metadata.customer,
        email: verification.customer.email,
        date: new Date().toISOString().slice(0, 10),
        status: 'Processing',
        shipping: metadata.shipping,
        items,
        payment_reference: reference,
        total,
      })
      .select()
      .single()

    if (insertError || !inserted) {
      return <FailureView message="Payment succeeded, but saving your order failed. Contact support with your reference." reference={reference} />
    }

    order = inserted

    await admin.from('payments').update({ order_id: orderId }).eq('reference', reference)

    for (const item of items) {
      const { data: product } = await admin.from('products').select('stock').eq('id', item.product_id).single()
      if (product) {
        await admin
          .from('products')
          .update({ stock: Math.max(0, product.stock - item.quantity) })
          .eq('id', item.product_id)
      }
    }

    await admin.from('cart_items').delete().eq('user_id', metadata.user_id)

    try {
      await resend.emails.send({
        from: 'Salami <onboarding@resend.dev>',
        to: [verification.customer.email],
        subject: `Order confirmed — ${orderId}`,
        html: `<p>Thank you for your order, ${metadata.customer}.</p><p>Order ${orderId} — ${formatPrice(total)}</p>`,
      })
      await resend.emails.send({
        from: 'Salami <onboarding@resend.dev>',
        to: ['salamiabdulsalami26@gmail.com'],
        subject: `New order — ${orderId}`,
        html: `<p>New order from ${metadata.customer} (${verification.customer.email}) — ${formatPrice(total)}</p>`,
      })
    } catch (emailErr) {
      console.error('Order email failed:', emailErr)
    }
  }

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
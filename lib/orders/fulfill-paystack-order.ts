import { verifyTransaction } from '@/lib/paystack'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatPrice } from '@/lib/products'
import type { Order } from '@/lib/orders'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type FulfillmentResult =
  | { ok: true; order: Order; alreadyProcessed: boolean }
  | { ok: false; error: string }

type OrderItem = {
  product_id: string
  name: string
  variant: string
  size: string
  quantity: number
  price: number
}

/**
 * Verifies a Paystack reference and, if the payment succeeded, ensures an order
 * exists for it — creating it, decrementing stock, clearing the cart, and sending
 * confirmation emails exactly once. Safe to call multiple times for the same
 * reference (e.g. once from the webhook, once from the browser callback landing
 * on the same order): the `payment_reference` uniqueness check makes this idempotent.
 */
export async function fulfillPaystackOrder(reference: string): Promise<FulfillmentResult> {
  if (!reference) return { ok: false, error: 'Missing payment reference.' }

  let verification
  try {
    verification = await verifyTransaction(reference)
  } catch (err: any) {
    return { ok: false, error: err.message || 'Could not verify payment.' }
  }

  const admin = createAdminClient()

  // Log every verification attempt regardless of outcome, for reconciliation.
  await admin.from('payments').upsert(
    {
      reference,
      user_id: (verification.metadata as any)?.user_id ?? null,
      email: verification.customer?.email ?? '',
      amount: verification.amount,
      status: verification.status,
      channel: verification.channel ?? null,
      raw_response: verification,
    },
    { onConflict: 'reference' },
  )

  if (verification.status !== 'success') {
    return { ok: false, error: 'Payment was not successful.' }
  }

  const { data: existing, error: existingError } = await admin
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .maybeSingle()

  if (existingError) {
    return { ok: false, error: existingError.message }
  }

  if (existing) {
    return { ok: true, order: existing as Order, alreadyProcessed: true }
  }

  const metadata = verification.metadata as {
    user_id: string
    customer: string
    shipping: string
    items: OrderItem[]
  }

  if (!metadata?.items?.length) {
    return { ok: false, error: 'Payment succeeded but order metadata is missing or malformed.' }
  }

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
      items: metadata.items,
      payment_reference: reference,
      total,
    })
    .select()
    .single()

  if (insertError || !inserted) {
    // Race: another request (webhook + callback firing near-simultaneously) may have
    // inserted the order between our existence check and this insert. Re-check before
    // reporting a hard failure.
    if (insertError?.code === '23505') {
      const { data: raceWinner } = await admin
        .from('orders')
        .select('*')
        .eq('payment_reference', reference)
        .maybeSingle()
      if (raceWinner) {
        return { ok: true, order: raceWinner as Order, alreadyProcessed: true }
      }
    }
    return {
      ok: false,
      error: `Payment succeeded, but saving your order failed: ${insertError?.message || 'Unknown error'}`,
    }
  }

  const order = inserted as Order

  await admin.from('payments').update({ order_id: orderId }).eq('reference', reference)

  for (const item of metadata.items) {
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()
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
    // Never fail the order over a broken email send — log and move on.
    console.error('Order confirmation email failed:', emailErr)
  }

  return { ok: true, order, alreadyProcessed: false }
}
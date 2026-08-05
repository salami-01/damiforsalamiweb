import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { fulfillPaystackOrder } from '@/lib/orders/fulfill-paystack-order'
import { createAdminClient } from '@/lib/supabase/admin'
import { refundPaystackOrder } from '@/lib/orders/refund-paystack-order'

export const dynamic = 'force-dynamic'

// Paystack retries webhooks that don't return 2xx, and will keep retrying for a while
// on failure — so this handler must be fast and must not throw for cases where retrying
// won't help (e.g. an already-processed reference).
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Do not leak whether the signature was missing vs. wrong.
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  let event: { event: string; data?: { reference?: string } }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  // Only charge.success moves an order forward. Other events (e.g. transfer events,
  // subscription events) are acknowledged and ignored.
  if (event.event !== 'charge.success') {
    if (event.event === 'refund.pending' || event.event === 'refund.processed') {
  const reference =
    (event.data as any)?.transaction_reference ?? (event.data as any)?.reference
    if (!reference) {
      return NextResponse.json(
        { error: 'Missing transaction reference in refund payload.' },
        { status: 400 },
      )
    }
    const result = await refundPaystackOrder(reference)
    if (!result.ok) {
      console.error('Webhook: refund processing failed for reference', reference, result.error)
      // Retry on any failure here — a dropped refund (stock never restored) is
      // worse than Paystack retrying a few extra times.
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
    return NextResponse.json({ received: true, orderId: result.order.id, refunded: true })
  }
    if (event.event === 'refund.failed') {
    const reference =
      (event.data as any)?.transaction_reference ?? (event.data as any)?.reference
    console.error(
      'Webhook: refund.failed received for reference',
      reference,
      '— a previously-refunded order may need manual review. Stock was already restored on refund.pending; this does NOT auto-reverse it.',
    )
    // Intentionally no DB writes here. Reversing a refund automatically is
    // higher-risk than leaving it for manual review — flagging via log/console
    // for now. TODO: surface this in the admin Payments tab instead of only
    // console.error, once there's a UI slot for "needs attention" states.
    return NextResponse.json({ received: true })
  }
    if (event.event === 'charge.failed' && event.data?.reference) {
    const admin = createAdminClient()
    await admin.from('payments').upsert(
      {
        reference: event.data.reference,
        email: (event.data as any)?.customer?.email ?? '',
        amount: (event.data as any)?.amount ?? 0,
        status: 'failed',
        channel: (event.data as any)?.channel ?? null,
        raw_response: event.data,
      },
      { onConflict: 'reference' },
    )
  }
    return NextResponse.json({ received: true })
  }

  const reference = event.data?.reference
  if (!reference) {
    return NextResponse.json({ error: 'Missing reference in webhook payload.' }, { status: 400 })
  }

  const result = await fulfillPaystackOrder(reference)

  if (!result.ok) {
    console.error('Webhook: fulfillment failed for reference', reference, result.error)
    // 200 here is intentional for "payment not successful" (nothing to retry), but a
    // 500 for genuine infra errors so Paystack retries.
    const isRetryable = /could not verify|saving your order failed|unknown error/i.test(
      result.error,
    )
    return NextResponse.json({ error: result.error }, { status: isRetryable ? 500 : 200 })
  }

  return NextResponse.json({ received: true, orderId: result.order.id })
}
// this is app\api\webhooks\paystack\route.ts file that handles incoming Paystack webhook requests. It verifies the webhook signature, checks for a successful charge event, and calls fulfillPaystackOrder to process the payment and create an order if necessary. It returns appropriate HTTP responses based on the outcome of the processing.
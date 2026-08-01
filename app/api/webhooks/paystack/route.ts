import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { fulfillPaystackOrder } from '@/lib/orders/fulfill-paystack-order'

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
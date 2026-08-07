import { NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/paystack'
import { fulfillPaystackOrder } from '@/lib/orders/fulfill-paystack-order'
import { refundPaystackOrder } from '@/lib/orders/refund-paystack-order'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Paystack retries webhooks that don't return a 2xx response, so this route
// should only return 500 for genuinely retryable failures.
export async function POST(req: Request) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  console.log('[paystack webhook] received', {
    hasSignature: !!signature,
    bodyLength: rawBody.length,
    bodyPreview: rawBody.slice(0, 100),
  })

  if (!verifyWebhookSignature(rawBody, signature)) {
    // Do not leak whether the signature was missing vs. wrong.
    console.error('[paystack webhook] signature verification failed')
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 })
  }

  console.log('[paystack webhook] signature verified')

  let event: {
    event: string
    data?: Record<string, any>
  }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { error: 'Invalid payload.' },
      { status: 400 },
    )
  }

  switch (event.event) {
    case 'charge.success': {
      const reference = event.data?.reference

      if (!reference) {
        return NextResponse.json(
          { error: 'Missing reference in webhook payload.' },
          { status: 400 },
        )
      }

      const result = await fulfillPaystackOrder(reference)

      if (!result.ok) {
        console.error(
          'Webhook: fulfillment failed for reference',
          reference,
          result.error,
        )

        // Retry only for infrastructure/transient failures.
        const isRetryable =
          /could not verify|saving your order failed|unknown error/i.test(
            result.error,
          )

        return NextResponse.json(
          { error: result.error },
          { status: isRetryable ? 500 : 200 },
        )
      }

      return NextResponse.json({
        received: true,
        orderId: result.order.id,
      })
    }

    case 'charge.failed': {
      if (event.data?.reference) {
        const admin = createAdminClient()

        await admin.from('payments').upsert(
          {
            reference: event.data.reference,
            email: event.data.customer?.email ?? '',
            amount: event.data.amount ?? 0,
            status: 'failed',
            channel: event.data.channel ?? null,
            raw_response: event.data,
          },
          {
            onConflict: 'reference',
          },
        )
      }

      return NextResponse.json({ received: true })
    }

    case 'refund.pending':
    case 'refund.processed': {
      const reference =
        event.data?.transaction_reference ??
        event.data?.reference

      if (!reference) {
        return NextResponse.json(
          {
            error: 'Missing transaction reference in refund payload.',
          },
          {
            status: 400,
          },
        )
      }

      const result = await refundPaystackOrder(reference)

      if (!result.ok) {
        console.error(
          'Webhook: refund processing failed for reference',
          reference,
          result.error,
        )

        // Return 500 so Paystack retries.
        return NextResponse.json(
          { error: result.error },
          { status: 500 },
        )
      }

      return NextResponse.json({
        received: true,
        refunded: true,
        orderId: result.order.id,
      })
    }

    case 'refund.failed': {
      const reference =
        event.data?.transaction_reference ??
        event.data?.reference

      console.error(
        'Webhook: refund.failed received for reference',
        reference,
        'A previously-restored order may require manual review.',
      )

      return NextResponse.json({ received: true })
    }

    default: {
      // Ignore every other Paystack event.
      return NextResponse.json({ received: true })
    }
  }
}
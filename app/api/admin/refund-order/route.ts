import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { refundPaystackOrder } from '@/lib/orders/refund-paystack-order'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  // Ensure the requester is an admin
  const adminUser = await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 403 }
    )
  }

  let body: { orderId?: unknown }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }

  const orderId =
    typeof body.orderId === 'string'
      ? body.orderId.trim()
      : ''

  if (!orderId) {
    return NextResponse.json(
      { error: 'orderId is required.' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('payment_reference')
    .eq('id', orderId)
    .maybeSingle()

  if (orderError || !order?.payment_reference) {
    return NextResponse.json(
      {
        error: 'Could not find a payment reference for this order.',
      },
      { status: 404 }
    )
  }

  const result = await refundPaystackOrder(
    order.payment_reference
  )

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: 422 }
    )
  }

  return NextResponse.json({
    order: result.order,
    alreadyProcessed: result.alreadyProcessed,
  })
}
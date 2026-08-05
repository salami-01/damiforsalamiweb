import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refundPaystackOrder } from '@/lib/orders/refund-paystack-order'

export const dynamic = 'force-dynamic'

function isAdmin(email: string | null | undefined): boolean {
    if (!email) return false
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    return adminEmails.includes(email.toLowerCase())
}

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!isAdmin(user?.email)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    let body: { orderId?: unknown }
    try {
    body = await req.json()
    } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : ''
    if (!orderId) {
        return NextResponse.json({ error: 'orderId is required.' }, { status: 400 })
    }

  // refundPaystackOrder takes a payment_reference, not an order id — look it up.
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const admin = createAdminClient()
    const { data: order, error: orderError } = await admin
        .from('orders')
        .select('payment_reference')
        .eq('id', orderId)
        .maybeSingle()

    if (orderError || !order?.payment_reference) {
        return NextResponse.json(
        { error: 'Could not find a payment reference for this order.' },
        { status: 404 },
        )
    }

    const result = await refundPaystackOrder(order.payment_reference)

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({ order: result.order, alreadyProcessed: result.alreadyProcessed })
    }
// this is app\api\admin\refund-order\route.ts
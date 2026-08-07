import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    const { id } = await params
    let body: { status?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const status = body.status as OrderStatus
    if (!ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    }

    // Refunds carry side effects (stock restoration) that only refundPaystackOrder
    // performs correctly — this route must never be the path that sets Refunded.
    if (status === 'Refunded') {
        return NextResponse.json(
        { error: 'Use /api/admin/refund-order to set Refunded status.' },
        { status: 400 },
        )
    }

    const supabase = createAdminClient()

    // Once an order is refunded, stock has already been restored by refundPaystackOrder.
    // A further status change here has no matching stock effect, so it would silently
    // leave stock double-counted. Block it server-side — the disabled dropdown in the
    // admin UI is only a client-side guard and doesn't stop a direct API call.
    const { data: existing, error: fetchError } = await supabase
        .from('orders')
        .select('status')
        .eq('id', id)
        .maybeSingle()

    if (fetchError || !existing) {
        return NextResponse.json({ error: 'Order not found.' }, { status: 404 })
    }

    if (existing.status === 'Refunded') {
        return NextResponse.json(
        { error: 'This order has been refunded and its status cannot be changed further.' },
        { status: 409 },
        )
    }

    const { error } = await supabase.from('orders').update({ status }).eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
//this is app/api/admin/orders/%5Bid%5D/status/route.ts
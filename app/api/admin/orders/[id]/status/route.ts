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
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
// this is app\api\admin\orders\[id]\status\route.ts
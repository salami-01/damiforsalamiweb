import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { fulfillPaystackOrder } from '@/lib/orders/fulfill-paystack-order'

export const dynamic = 'force-dynamic'


export async function POST(req: Request) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    let body: { reference?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const reference = typeof body.reference === 'string' ? body.reference.trim() : ''
    if (!reference) {
        return NextResponse.json({ error: 'Reference is required.' }, { status: 400 })
    }

    const result = await fulfillPaystackOrder(reference)

    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 422 })
    }

    return NextResponse.json({ order: result.order, alreadyProcessed: result.alreadyProcessed })
}
//this is app\api\admin\retry-fulfillment\route.ts
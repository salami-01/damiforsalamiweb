import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    const { id } = await params
    let body: { compareAtPrice?: unknown; promoEndsAt?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const compareAtPrice =
        body.compareAtPrice === null || typeof body.compareAtPrice === 'number'
        ? body.compareAtPrice
        : undefined
    const promoEndsAt =
        body.promoEndsAt === null || typeof body.promoEndsAt === 'string'
        ? body.promoEndsAt
        : undefined

    if (compareAtPrice === undefined || promoEndsAt === undefined) {
        return NextResponse.json(
        { error: 'compareAtPrice (number|null) and promoEndsAt (string|null) are required.' },
        { status: 400 },
        )
    }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('products')
        .update({ compareAtPrice, promoEndsAt })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
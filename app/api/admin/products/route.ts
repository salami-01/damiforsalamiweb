import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Product } from '@/lib/products'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    let body: Product
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    if (!body.id || !body.name) {
        return NextResponse.json({ error: 'id and name are required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('products').insert(body)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
//this is app\api\admin\products\route.ts
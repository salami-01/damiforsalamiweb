import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    let body: { id?: unknown; label?: unknown; sort_order?: unknown }
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    if (typeof body.id !== 'string' || !body.id.trim()) {
        return NextResponse.json({ error: 'id is required.' }, { status: 400 })
    }
    if (typeof body.label !== 'string' || !body.label.trim()) {
        return NextResponse.json({ error: 'label is required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('categories').insert({
        id: body.id,
        label: body.label,
        sort_order: typeof body.sort_order === 'number' ? body.sort_order : 0,
    })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    } 

    return NextResponse.json({ ok: true })
}
// this is app\api\admin\categories\route.ts
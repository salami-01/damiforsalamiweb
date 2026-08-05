import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    const { id } = await params
    const supabase = createAdminClient()
    const { error } = await supabase
        .from('contact_messages')
        .update({ read: true })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
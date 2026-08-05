import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SiteContent } from '@/lib/site-content'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    let body: SiteContent
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
        .from('site_content')
        .update({ content: body })
        .eq('id', 1)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
}
//this is app\api\admin\site-content\route.ts
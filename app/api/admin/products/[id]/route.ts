import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    const { id } = await params
    let body: Record<string, unknown>
    try {
        body = await req.json()
    } catch {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase
    .from('products')
    .update({
        name: body.name,
        variant: body.variant,
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        promoEndsAt: body.promoEndsAt ?? null,
        image: body.image,
        images: body.images ?? [],
        stock: body.stock,
        category: body.category ?? null,
        sizes: body.sizes ?? [],
        badges: body.badges ?? [],
        })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
    }

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const admin = await requireAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

    const { id } = await params
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').delete().eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
    }
    //this is app\api\admin\products\[id]\route.ts
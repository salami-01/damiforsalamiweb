import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/require-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ensure the requester is an admin
  const adminUser = await requireAdmin()

  if (!adminUser) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  const { data: orderCounts, error: orderError } = await supabase
    .from('orders')
    .select('user_id')

  if (orderError) {
    return NextResponse.json(
      { error: orderError.message },
      { status: 500 }
    )
  }

  const countMap = new Map<string, number>()

  for (const row of orderCounts ?? []) {
    if (!row.user_id) continue

    countMap.set(
      row.user_id,
      (countMap.get(row.user_id) ?? 0) + 1
    )
  }

  const users = data.users.map((user) => ({
    id: user.id,
    email: user.email,
    name:
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    confirmed: Boolean(user.email_confirmed_at),
    orderCount: countMap.get(user.id) ?? 0,
  }))

  return NextResponse.json({ users })
}
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? '')) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const { data: orderCounts } = await admin.from('orders').select('user_id')
  const countMap = new Map<string, number>()
  for (const row of orderCounts ?? []) {
    countMap.set(row.user_id, (countMap.get(row.user_id) ?? 0) + 1)
  }

  const users = data.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: (u.user_metadata?.full_name as string) ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
    confirmed: !!u.email_confirmed_at,
    orderCount: countMap.get(u.id) ?? 0,
  }))

  return Response.json({ users })
}
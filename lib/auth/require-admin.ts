import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Returns the admin's email if the current session belongs to an admin,
 * or null otherwise. Single source of truth for "who is an admin" —
 * every admin API route should call this instead of re-checking anything else.
 * Backed by the public.admin_emails table (same table is_admin() checks in RLS),
 * so app-side and DB-side admin status can never drift apart.
 */
export async function requireAdmin(): Promise<{ email: string } | null> {
    const supabase = await createClient()
    const {
    data: { user },
    } = await supabase.auth.getUser()

    const email = user?.email?.toLowerCase()
    if (!email) return null

  // Service-role client: admin_emails has no policies for the authenticated
  // role, so this must bypass RLS the same way is_admin() does via SECURITY DEFINER.
    const admin = createAdminClient()
    const { data, error } = await admin
        .from('admin_emails')
        .select('email')
        .eq('email', email)
        .maybeSingle()

    if (error || !data) return null
    return { email }
    }
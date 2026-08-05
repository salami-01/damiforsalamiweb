import { createClient } from '@/lib/supabase/server'

/**
 * Returns the admin's email if the current session belongs to an admin,
 * or null otherwise. Single source of truth for "who is an admin" —
 * every admin API route should call this instead of re-checking ADMIN_EMAILS.
 */
export async function requireAdmin(): Promise<{ email: string } | null> {
    const supabase = await createClient()
    const {
    data: { user },
    } = await supabase.auth.getUser()

    const email = user?.email?.toLowerCase()
    if (!email) return null

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())

    if (!adminEmails.includes(email)) return null
    return { email }
}
//this is lib\auth\require-admin.ts
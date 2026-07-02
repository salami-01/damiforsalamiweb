import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const adminEmails = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/')
  }

  return (
    <div className="admin-theme min-h-screen bg-background text-foreground">
      {children}
    </div>
  )
}
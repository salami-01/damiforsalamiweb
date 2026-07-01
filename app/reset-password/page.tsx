'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AuthChangeEvent, Session } from '@supabase/supabase-js'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    }
  )

  return () => listener.subscription.unsubscribe()
}, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/login')
  }

  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-brand-slate px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-brand-bone">
          Set New Password
        </h1>

        {error && <p className="mt-6 text-sm text-brand-red">{error}</p>}

        {ready ? (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 text-sm text-brand-bone outline-none focus:border-brand-red"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-red py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        ) : (
          <p className="mt-10 text-sm text-brand-bone/60">
            Verifying your reset link...
          </p>
        )}
      </div>
    </main>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthError } from '@supabase/supabase-js'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const { session } = data
      if (session) {
        setReady(true)
        return
      }

      const hash = window.location.hash
      if (hash.includes('type=recovery')) {
        supabase.auth.exchangeCodeForSession(window.location.href).then(({ error }: { error: AuthError | null }) => {
          if (error) {
            setError('Reset link is invalid or has expired. Please request a new one.')
          } else {
            setReady(true)
          }
        })
      } else {
        const { data: listener } = supabase.auth.onAuthStateChange((event: string) => {
          if (event === 'PASSWORD_RECOVERY') {
            setReady(true)
            listener.subscription.unsubscribe()
          }
        })
      }
    })
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
    setTimeout(() => router.push('/shop'), 2500)
  }

  const inputClass =
    'w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 text-sm text-brand-bone outline-none focus:border-brand-red'

  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-brand-slate px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-brand-bone">
          Set New Password
        </h1>

        {error && <p className="mt-6 text-sm text-brand-red">{error}</p>}

        {done ? (
          <div className="mt-10 rounded-md bg-emerald-500/15 px-4 py-4 text-sm text-emerald-400">
            Password updated. Redirecting you to the shop...
          </div>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
                New password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div>
              <label className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
                Confirm password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
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
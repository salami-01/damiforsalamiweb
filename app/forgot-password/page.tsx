'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setMessage('Check your email for a password reset link.')
  }

  return (
    <main className="flex min-h-[100svh] w-full items-center justify-center bg-brand-slate px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-brand-bone">
          Reset Password
        </h1>
        <p className="mt-4 text-sm text-brand-bone/60">
          Enter your email and we'll send you a reset link.
        </p>

        {message && <p className="mt-6 text-sm text-emerald-400">{message}</p>}
        {error && <p className="mt-6 text-sm text-brand-red">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 text-sm text-brand-bone outline-none focus:border-brand-red"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-red py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </main>
  )
}
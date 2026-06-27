'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'

const SPRING = { type: 'spring' as const, stiffness: 60, damping: 18, mass: 1 }
const EASE = [0.22, 1, 0.36, 1] as const

const inputClass =
  'w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 font-sans text-sm text-brand-bone outline-none transition-colors placeholder:text-brand-bone/30 focus:border-brand-red'

function VisualPanel() {
  return (
    <motion.div
      layout
      layoutId="auth-visual"
      transition={SPRING}
      className="relative hidden overflow-hidden bg-brand-burgundy md:block md:flex-1"
    >
      <motion.div
        layout
        className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-red/60 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        layout
        className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-black/70 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        layout
        className="absolute left-1/3 top-1/2 h-72 w-72 rounded-full bg-brand-charcoal/80 blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="relative flex h-full flex-col justify-between p-12">
        <span className="font-heading text-3xl font-black uppercase tracking-tighter text-brand-bone">
          SM
        </span>
        <p className="max-w-xs font-heading text-2xl font-bold uppercase leading-tight tracking-tight text-brand-bone">
          Worn in the dark.
          <span className="block text-brand-bone/50">Made for the few.</span>
        </p>
      </div>
    </motion.div>
  )
}

export function AuthPanels({ initialMode = 'signin' }: { initialMode?: 'signin' | 'create' }) {
  const [mode, setMode] = useState<'signin' | 'create'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const isSignIn = mode === 'signin'
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  function switchMode(next: 'signin' | 'create') {
    setMode(next)
    setError(null)
    setMessage(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string

    if (isSignIn) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      router.push(searchParams.get('next') || '/')
      router.refresh()
    } else {
  const next = searchParams.get('next')
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${window.location.origin}/login${next ? `?next=${encodeURIComponent(next)}` : ''}`,
    },
  })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      setMessage('Check your email to confirm your account before signing in.')
    }
  }

  const form = (
    <motion.div
      layout
      layoutId="auth-form"
      transition={SPRING}
      className="flex flex-1 items-center justify-center bg-brand-slate px-6 py-28 md:py-0"
    >
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <h1 className="font-heading text-4xl font-black uppercase leading-none tracking-tighter text-brand-bone sm:text-5xl">
              {isSignIn ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-4 text-sm text-brand-bone/60">
              {isSignIn ? 'Sign in to continue' : 'Join Salami'}
            </p>

            {message && <p className="mt-6 text-sm text-emerald-400">{message}</p>}
            {error && <p className="mt-6 text-sm text-brand-red">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
              {!isSignIn && (
                <div>
                  <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
                    Name
                  </label>
                  <input id="name" name="name" className={inputClass} placeholder="Your name" />
                </div>
              )}
              <div>
                <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
                  Email
                </label>
                <input id="email" name="email" type="email" required className={inputClass} placeholder="you@email.com" />
              </div>
              <div>
                <label htmlFor="password" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
                  Password
                </label>
                <input id="password" name="password" type="password" required minLength={6} className={inputClass} placeholder="••••••••" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-brand-red py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Please wait...' : isSignIn ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className="mt-8 flex flex-col gap-3 text-sm">
              <button
                type="button"
                onClick={() => switchMode(isSignIn ? 'create' : 'signin')}
                className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-brand-bone/60 transition-colors hover:text-brand-red"
              >
                {isSignIn ? 'New here? Create account' : 'Have an account? Sign in'}
              </button>
              {isSignIn && (
                <Link
                  href="/forgot-password"
                  className="self-start font-mono text-[11px] uppercase tracking-[0.2em] text-brand-bone/40 transition-colors hover:text-brand-bone/70"
                >
                  Forgot password?
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )

  return (
    <main className="flex min-h-[100svh] w-full flex-col bg-brand-slate md:flex-row">
      {isSignIn ? (
        <>
          {form}
          <VisualPanel />
        </>
      ) : (
        <>
          <VisualPanel />
          {form}
        </>
      )}
    </main>
  )
}
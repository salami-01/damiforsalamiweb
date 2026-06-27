'use client'

import { useState } from 'react'

const inputClass =
  'w-full border-0 border-b border-brand-bone/25 bg-transparent py-3 font-sans text-sm text-brand-bone outline-none transition-colors placeholder:text-brand-bone/30 focus:border-brand-red'

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-64 flex-col justify-center border border-brand-bone/15 p-10">
        <p className="font-heading text-2xl font-bold uppercase tracking-tight text-brand-bone">
          Message received
        </p>
        <p className="mt-3 text-brand-bone/60">
          Thank you for writing. We will respond shortly.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-8 self-start font-mono text-[11px] uppercase tracking-[0.25em] text-brand-red underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {error && <p className="text-sm text-brand-red">{error}</p>}
      <div>
        <label htmlFor="name" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
          Name
        </label>
        <input id="name" name="name" required className={inputClass} placeholder="Your name" />
      </div>
      <div>
        <label htmlFor="email" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
          Email
        </label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="you@email.com" />
      </div>
      <div>
        <label htmlFor="message" className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/40">
          Message
        </label>
        <textarea id="message" name="message" required rows={4} className={`${inputClass} resize-none`} placeholder="Tell us more" />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-2 self-start bg-brand-red px-12 py-4 font-mono text-xs uppercase tracking-[0.3em] text-brand-bone transition-opacity duration-300 hover:opacity-90 disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
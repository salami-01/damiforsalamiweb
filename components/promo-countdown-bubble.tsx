'use client'

import { useEffect, useState } from 'react'

/** Floating bubble counting down to the given ISO timestamp. Unmounts itself once it hits zero. */
export function PromoCountdownBubble({ endsAt }: { endsAt: string }) {
  const target = new Date(endsAt).getTime()
  const [remaining, setRemaining] = useState(() => target - Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(target - Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  if (remaining <= 0) return null

  const totalSeconds = Math.floor(remaining / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-brand-bone/20 bg-brand-black/90 px-6 py-3 text-center shadow-lg shadow-black/40 backdrop-blur-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-brand-bone/50">
        Next promo ends in
      </p>
      <p className="mt-1 font-heading text-lg font-bold tabular-nums text-brand-bone">
        {days > 0 && `${days}d `}
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:
        {String(seconds).padStart(2, '0')}
      </p>
    </div>
  )
}

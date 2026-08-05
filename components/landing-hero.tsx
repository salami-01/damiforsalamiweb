'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { getSiteContent } from '@/lib/site-content'
import type { SiteContent } from '@/lib/site-content'

type LandingImages = SiteContent['landing']

export function LandingHero() {
  const [index, setIndex] = useState(0)
  const [content, setContent] = useState<LandingImages | null>(null)
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null) // null = not yet determined

  // Fetch the admin-managed image sets once, via the shared site-content helper.
  useEffect(() => {
    let cancelled = false
    getSiteContent().then((data) => {
      if (cancelled) return
      setContent(data?.landing ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Track orientation live so resizing/rotating swaps the active image set.
  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait)')
    setIsPortrait(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsPortrait(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  // Resolve the active image set: orientation-specific set if it has images,
  // otherwise fall back to the general set, otherwise the static default.
  const images = (() => {
    if (!content || isPortrait === null) return null
    const specific = isPortrait ? content.portraitImages : content.landscapeImages
    if (specific?.length) return specific
    if (content.images?.length) return content.images
    return ['/campaign/hero.png']
  })()

  const intervalMs = content?.intervalMs ?? 4000

  // Reset to the first slide whenever the active image set changes (e.g. on
  // orientation change) so we don't end up pointing at an out-of-range index.
  useEffect(() => {
    setIndex(0)
  }, [images])

  const next = useCallback(() => {
    setIndex((i) => (images ? (i + 1) % images.length : 0))
  }, [images])

  useEffect(() => {
    if (!images || images.length <= 1) return
    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [next, images, intervalMs])

  return (
    <main className="relative h-svh w-full overflow-hidden bg-brand-black">
      {images &&
        images.map((src, i) => (
          <motion.img
            key={src}
            src={src}
            alt="Salami campaign"
            initial={{ opacity: i === 0 && index === 0 ? 1 : 0 }}
            animate={{ opacity: i === index ? 1 : 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ))}

      <div className="absolute inset-0 bg-linear-to-b from-brand-black/70 via-brand-black/30 to-brand-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      {images && images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-brand-bone' : 'w-1.5 bg-brand-bone/40'
              }`}
            />
          ))}
        </div>
      )}

      <Link
        href="/shop"
        aria-label="Enter the site"
        className="group absolute bottom-12 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 border border-brand-bone/50 bg-brand-black/40 px-8 py-4 backdrop-blur-sm transition-all duration-500 hover:border-brand-bone hover:bg-brand-bone hover:text-brand-black"
      >
        <span className="font-mono text-xs uppercase tracking-[0.4em] text-brand-bone transition-colors duration-500 group-hover:text-brand-black">
          Enter
        </span>
        <motion.span
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="text-brand-bone transition-colors duration-500 group-hover:text-brand-black"
        >
          →
        </motion.span>
      </Link>
    </main>
  )
}
//components\landing-hero.tsx
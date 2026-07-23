'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import { supabase } from '@/lib/supabase'
import type { SiteContent } from '@/lib/site-content'

export function LandingHero() {
  const [index, setIndex] = useState(0)
  const [images, setImages] = useState<string[]>(['/campaign/hero.png'])
  const [intervalMs, setIntervalMs] = useState(4000)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('content')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        const landing = (data?.content as SiteContent)?.landing
        if (landing?.images?.length) setImages(landing.images)
        if (landing?.intervalMs) setIntervalMs(landing.intervalMs)
      })
  }, [])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(next, intervalMs)
    return () => clearInterval(timer)
  }, [next, images.length, intervalMs])

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-brand-black">
      {images.map((src, i) => (
        <motion.img
          key={src}
          src={src}
          alt="Salami campaign"
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/30 to-brand-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      {images.length > 1 && (
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
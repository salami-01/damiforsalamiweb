'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion } from 'motion/react'

export function LandingHero() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playCount, setPlayCount] = useState(0)
  const [showFinalImage, setShowFinalImage] = useState(false)

  function handleEnded() {
    const next = playCount + 1
    if (next >= 3) {
      setShowFinalImage(true)
    } else {
      setPlayCount(next)
      videoRef.current?.play()
    }
  }

  return (
    <main className="relative h-[100svh] w-full overflow-hidden bg-brand-black">
      {!showFinalImage ? (
  <video
    ref={videoRef}
    autoPlay
    muted
    playsInline
    onEnded={handleEnded}
    poster="/campaign/hero.png"
    className="absolute inset-0 h-full w-full object-cover"
  >
    <source src="/hero-video.mp4" type="video/mp4" />
  </video>
) : (
  <>
    <motion.img
      src="/campaign/hero.png"
      alt="Salami campaign film still"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="absolute inset-0 h-full w-full object-cover brightness-125"
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, delay: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <img src="/logo.png" alt="Salami" className="w-64 sm:w-96" />
    </motion.div>
  </>
)}

      {/* Cinematic grading overlays — contrast only, no text content */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black/70 via-brand-black/30 to-brand-black/80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_100%)]" />

      {/* Only thing on screen besides the video */}
      <Link
        href="/home"
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
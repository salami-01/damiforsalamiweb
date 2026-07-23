'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react'

export type CarouselBadge = { label: string; tone: 'sale' | 'info' }

export function ProductImageCarousel({
  images,
  alt,
  badges = [],
}: {
  images: string[]
  alt: string
  badges?: CarouselBadge[]
}) {
  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const slides = images.length > 0 ? images : ['/placeholder.svg']

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length)
  }, [slides.length])

  const prev = () => {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (slides.length <= 1 || zoomed) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, slides.length, zoomed])

  // Close the lightbox on Escape.
  useEffect(() => {
    if (!zoomed) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoomed(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomed])

  return (
    <div className="flex gap-3">
      {slides.length > 1 && (
        <div className="hidden max-h-[560px] shrink-0 flex-col gap-2 overflow-y-auto sm:flex">
          {slides.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`View image ${i + 1}`}
              className={`h-20 w-16 shrink-0 overflow-hidden border transition-colors ${
                i === index ? 'border-brand-red' : 'border-brand-bone/15 hover:border-brand-bone/40'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative flex-1 overflow-hidden bg-brand-graphite">
        {badges.length > 0 && (
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {badges.map((b, i) => (
              <span
                key={`${b.label}-${i}`}
                className={`w-fit rounded-sm px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${
                  b.tone === 'sale' ? 'bg-emerald-500 text-black' : 'bg-brand-black/80 text-brand-bone'
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>
        )}

        <img
          src={slides[index]}
          alt={alt}
          className="aspect-[4/5] w-full object-cover transition-opacity duration-500"
        />

        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Zoom image"
          className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-sm bg-brand-black/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide text-brand-bone transition-colors hover:bg-brand-black"
        >
          <ZoomIn className="h-3.5 w-3.5" /> Zoom
        </button>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-brand-bone hover:bg-black/60"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-brand-bone hover:bg-black/60"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:hidden">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === index ? 'w-5 bg-brand-bone' : 'w-1.5 bg-brand-bone/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            onClick={() => setZoomed(false)}
            aria-label="Close zoom"
            className="absolute right-6 top-6 text-brand-bone hover:opacity-70"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={slides[index]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}
    </div>
  )
}

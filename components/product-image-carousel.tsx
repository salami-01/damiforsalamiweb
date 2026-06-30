'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0)
  const slides = images.length > 0 ? images : ['/placeholder.svg']

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % slides.length)
  }, [slides.length])

  const prev = () => {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, slides.length])

  return (
    <div className="relative overflow-hidden bg-brand-graphite">
      <img
        src={slides[index]}
        alt={alt}
        className="aspect-[4/5] w-full object-cover transition-opacity duration-500"
      />

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

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
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
  )
}
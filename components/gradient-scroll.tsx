'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'motion/react'

type Props = {
  /** Ordered list of hex colors to interpolate through as the user scrolls. */
  colors: string[]
  children: ReactNode
  className?: string
}

/**
 * Scroll-linked background. The background color interpolates smoothly through
 * the provided palette as the user scrolls the section — never a hard cut.
 */
export function GradientScroll({ colors, children, className }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  const stops = colors.map((_, i) => i / (colors.length - 1))
  const backgroundColor = useTransform(scrollYProgress, stops, colors)

  return (
    <motion.div ref={ref} style={{ backgroundColor }} className={className}>
      {children}
    </motion.div>
  )
}

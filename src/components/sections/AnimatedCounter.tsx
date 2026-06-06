'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedCounterProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export default function AnimatedCounter({
  end,
  duration = 2,
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      const startTime = Date.now()
      const durationMs = duration * 1000

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / durationMs, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setCount(Math.floor(eased * end))

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setCount(end)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isInView, end, duration])

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  )
}

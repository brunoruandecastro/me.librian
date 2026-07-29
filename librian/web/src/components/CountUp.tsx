"use client"

import { useEffect, useState } from "react"

type Props = {
  value: number
  durationMs?: number
  className?: string
}

export default function CountUp({ value, durationMs = 1100, className }: Props) {
  const [display, setDisplay] = useState(0)
  const target = Math.max(0, Math.floor(value))

  useEffect(() => {
    if (target === 0) {
      setDisplay(0)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - (1 - progress) ** 3
      setDisplay(Math.round(target * eased))
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs])

  return (
    <span className={className} aria-label={String(target)}>
      {display}
    </span>
  )
}

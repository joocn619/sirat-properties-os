'use client'

import { useEffect, useState } from 'react'

interface CountUpValueProps {
  value: number
}

export function CountUpValue({ value }: CountUpValueProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 700
    const start = performance.now()

    const frame = (timestamp: number) => {
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayValue(Math.round(value * eased))
      if (progress < 1) {
        window.requestAnimationFrame(frame)
      }
    }

    const handle = window.requestAnimationFrame(frame)
    return () => window.cancelAnimationFrame(handle)
  }, [value])

  return <>{displayValue.toLocaleString('en-US')}</>
}

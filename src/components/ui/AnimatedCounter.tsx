'use client'

import { useEffect, useState, useRef } from 'react'

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 2000 }: AnimatedCounterProps) {
  const numericMatch = value.match(/\d+/)
  const targetNumber = numericMatch ? parseInt(numericMatch[0], 10) : 0
  const prefix = value.substring(0, numericMatch ? value.indexOf(numericMatch[0]) : 0)
  const suffix = numericMatch ? value.substring(value.indexOf(numericMatch[0]) + numericMatch[0].length) : value

  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!targetNumber) {
      return
    }

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !hasAnimated) {
            setHasAnimated(true)
            
            let startTimestamp: number | null = null
            const step = (timestamp: number) => {
              if (!startTimestamp) startTimestamp = timestamp
              const progress = Math.min((timestamp - startTimestamp) / duration, 1)
              
              // easeOutExpo for a smoother finish
              const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
              
              setCount(Math.floor(easeProgress * targetNumber))
              
              if (progress < 1) {
                window.requestAnimationFrame(step)
              } else {
                setCount(targetNumber)
              }
            }
            window.requestAnimationFrame(step)
          }
        },
        { threshold: 0.5 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, 2000)

    return () => clearTimeout(timer)
  }, [targetNumber, duration, hasAnimated])

  if (!targetNumber) {
    return <span>{value}</span>
  }

  return (
    <span ref={elementRef}>
      {prefix}{count}{suffix}
    </span>
  )
}

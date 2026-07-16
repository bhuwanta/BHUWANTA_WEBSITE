'use client'

import { useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

// Dynamic imports for non-critical UI — defers ~100 KiB (includes framer-motion)
// These must be in a Client Component because `ssr: false` is not allowed in Server Components
const WhatsAppFloat = dynamic(
  () => import('@/components/tracking/WhatsAppFloat').then(m => m.WhatsAppFloat),
  { ssr: false }
)
const LeadPopup = dynamic(
  () => import('@/components/popups/LeadPopup').then(m => m.LeadPopup),
  { ssr: false }
)

export function DynamicClientComponents({ projectsList = [], locationNames = [] }: { projectsList?: { name: string, location: string }[], locationNames?: string[] }) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const handleInteract = () => setShouldRender(true)
    const events = ['scroll', 'mousemove', 'touchstart', 'keydown']
    
    events.forEach(e => window.addEventListener(e, handleInteract, { once: true, passive: true }))
    
    // Fallback: if user does nothing for 7 seconds, load it anyway
    const timer = setTimeout(handleInteract, 7000)

    return () => {
      clearTimeout(timer)
      events.forEach(e => window.removeEventListener(e, handleInteract))
    }
  }, [])

  if (!shouldRender) return null

  return (
    <>
      <WhatsAppFloat />
      <LeadPopup projectsList={projectsList} locationNames={locationNames} />
    </>
  )
}

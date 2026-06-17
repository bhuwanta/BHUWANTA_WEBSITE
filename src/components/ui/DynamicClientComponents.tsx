'use client'

import { useState, useEffect } from 'react'

import dynamic from 'next/dynamic'

// Dynamic imports for non-critical UI — defers ~100 KiB (includes framer-motion)
// These must be in a Client Component because `ssr: false` is not allowed in Server Components
const WhatsAppFloat = dynamic(
  () => import('@/components/ui/WhatsAppFloat').then(m => m.WhatsAppFloat),
  { ssr: false }
)
const LeadPopup = dynamic(
  () => import('@/components/ui/LeadPopup').then(m => m.LeadPopup),
  { ssr: false }
)

export function DynamicClientComponents({ projectNames = [] }: { projectNames?: string[] }) {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  if (!shouldRender) return null

  return (
    <>
      <WhatsAppFloat />
      <LeadPopup projectNames={projectNames} />
    </>
  )
}

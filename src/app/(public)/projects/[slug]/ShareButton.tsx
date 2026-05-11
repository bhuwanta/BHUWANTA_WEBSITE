'use client'

import { Share2 } from 'lucide-react'

export function ShareButton({ title, text }: { title: string, text: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing', error)
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <button
      onClick={handleShare}
      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg bg-white border border-[#e8ecf2] text-[#0f1d33] transition-premium hover:bg-[#f8f9fb] shadow-sm"
    >
      <Share2 className="w-4 h-4" /> Share Project
    </button>
  )
}

'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

export function BlogSubscribeForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)

    try {
      // Submit as a lead with blog subscription source
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Blog Subscriber',
          email,
          phone: '',
          budget: '',
          sourcePage: 'Blog - Subscribe',
        }),
      })
      setSubmitted(true)
    } catch {
      // Still show success to user
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-600">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">You&apos;ll be notified when we publish!</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email"
        className="flex-1 px-4 py-3 rounded-lg bg-white border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg gradient-gold text-white disabled:opacity-50 transition-premium hover:scale-105 glow-gold shrink-0"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Notify Me
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      toast.success(data.message || 'Successfully subscribed to the newsletter!')
      setEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-8 sm:p-12 text-center">
      <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33] mb-4">
        Subscribe to Our <span className="text-[#c4a55a]">Newsletter</span>
      </h2>
      <p className="text-[#5a6a82] text-sm sm:text-base mb-8 max-w-2xl mx-auto">
        Get the latest real estate updates, investment tips, and project launches directly in your inbox.
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
        <input 
          type="email" 
          placeholder="Your Email Address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="flex-1 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-3 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] transition-colors placeholder-[#5a6a82] disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="gradient-gold text-white font-semibold rounded-lg px-6 py-3 shadow-lg shadow-[#c4a55a]/20 hover:scale-105 transition-premium text-sm whitespace-nowrap flex items-center justify-center min-w-[120px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
      </form>
    </div>
  )
}

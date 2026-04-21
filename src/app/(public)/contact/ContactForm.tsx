'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

interface ContactFormProps {
  labels: {
    name: string
    email: string
    phone: string
    budget: string
    submit: string
  }
  thankYouMessage: string
}

export function ContactForm({ labels: rawLabels, thankYouMessage }: ContactFormProps) {
  const labels = rawLabels || {
    name: 'Full Name',
    email: 'Email (Optional)',
    phone: 'Phone Number',
    budget: 'Approx. Budget',
    submit: 'Book Site Visit',
  }
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      budget: formData.get('budget') as string,
      sourcePage: 'Website',
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[#002935] mb-2">Message Sent!</h3>
        <p className="text-[#5a6a82]">{thankYouMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Name & Phone Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#002935] mb-2">
            {labels.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#BA9832]/50 focus:ring-1 focus:ring-[#BA9832]/30 transition-premium text-sm"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-[#002935] mb-2">
            {labels.phone} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#BA9832]/50 focus:ring-1 focus:ring-[#BA9832]/30 transition-premium text-sm"
            placeholder="+91 XXXXX XXXXX"
          />
        </div>
      </div>

      {/* Email & Budget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#002935] mb-2">
            {labels.email} <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#BA9832]/50 focus:ring-1 focus:ring-[#BA9832]/30 transition-premium text-sm"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-[#002935] mb-2">
            {labels.budget} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="budget"
            name="budget"
            required
            className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#BA9832]/50 focus:ring-1 focus:ring-[#BA9832]/30 transition-premium text-sm"
            placeholder="e.g. 50 Lakhs"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        id="contact-form-submit"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-lg gradient-gold text-white disabled:opacity-50 transition-premium hover:scale-105 glow-gold"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {labels.submit}
      </button>
    </form>
  )
}

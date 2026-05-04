'use client'

import { useState } from 'react'
import { Send, CheckCircle2, Loader2 } from 'lucide-react'

export function ProjectRegistrationForm() {
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
      location: formData.get('location') as string,
      message: formData.get('message') as string,
      budget: 'Project Interest',
      sourcePage: 'Home - Site Visit Form',
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
      <div className="text-center py-8">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h4 className="text-lg font-semibold text-[#002935] mb-1">Thank You!</h4>
        <p className="text-sm text-[#5a6a82]">We&apos;ll contact you shortly with project details.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="enquiry-registration-form">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="enquiry-name" className="block text-sm font-medium text-[#002935] mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="enquiry-name"
          name="name"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="enquiry-phone" className="block text-sm font-medium text-[#002935] mb-1.5">
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          id="enquiry-phone"
          name="phone"
          required
          className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm"
          placeholder="+91 XXXXX XXXXX"
        />
      </div>

      <div>
        <label htmlFor="enquiry-email" className="block text-sm font-medium text-[#002935] mb-1.5">
          Email
        </label>
        <input
          type="email"
          id="enquiry-email"
          name="email"
          className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="enquiry-location" className="block text-sm font-medium text-[#002935] mb-1.5">
          Preferred Location
        </label>
        <select
          id="enquiry-location"
          name="location"
          className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm appearance-none"
        >
          <option value="">Select a location (Optional)</option>
          <option value="hyderabad-south">Hyderabad South</option>
          <option value="hyderabad-west">Hyderabad West</option>
          <option value="hyderabad-east">Hyderabad East</option>
          <option value="hyderabad-north">Hyderabad North</option>
          <option value="other">Other / Not Sure</option>
        </select>
      </div>

      <div>
        <label htmlFor="enquiry-message" className="block text-sm font-medium text-[#002935] mb-1.5">
          Message
        </label>
        <textarea
          id="enquiry-message"
          name="message"
          rows={3}
          className="w-full px-4 py-3 rounded-lg bg-[#f8f9fb] border border-[#e8ecf2] text-[#002935] placeholder:text-[#5a6a82]/50 focus:outline-none focus:border-[#7D651F]/50 focus:ring-1 focus:ring-[#7D651F]/30 transition-premium text-sm resize-none"
          placeholder="Any specific requirements or questions?"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg gradient-gold text-white disabled:opacity-50 transition-premium hover:scale-[1.02] glow-gold"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Register Your Interest
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { Lock, Printer } from 'lucide-react'

export function GatedResource({
  resourceName,
  teaser,
  children,
}: {
  resourceName: string
  teaser: string
  children: React.ReactNode
}) {
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit number')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          enquiryType: `Document Download: ${resourceName}`,
          sourcePage: `Lead Magnet — ${resourceName}`,
        }),
      })
      if (!res.ok) throw new Error('Failed to save your details. Please try again.')
      setUnlocked(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (unlocked) {
    return (
      <div>
        <div className="flex justify-end mb-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#e8ecf2] text-[#1e3a5f] font-semibold rounded-lg hover:border-[#c4a55a] transition-premium text-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save as PDF
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="bg-[#f7f8fa] border border-[#e8ecf2] rounded-2xl p-8 sm:p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center mx-auto mb-6">
        <Lock className="w-6 h-6 text-[#1e3a5f]" />
      </div>
      <p className="text-[#5a6a82] leading-relaxed max-w-xl mx-auto mb-8">{teaser}</p>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium mb-6 max-w-sm mx-auto">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto space-y-3">
        <input
          required
          type="text"
          placeholder="Full Name *"
          aria-label="Full Name"
          className="w-full px-4 py-3 bg-white border border-[#e8ecf2] rounded-xl text-sm text-[#0f1d33] placeholder:text-[#5a6a82]/60 focus:outline-none focus:ring-2 focus:ring-[#c4a55a] transition-all"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div>
          <input
            required
            type="tel"
            placeholder="Mobile Number *"
            aria-label="Mobile Number"
            minLength={10}
            pattern="[0-9]{10}"
            className={`w-full px-4 py-3 bg-white border ${phoneError ? 'border-red-500' : 'border-[#e8ecf2]'} rounded-xl text-sm text-[#0f1d33] placeholder:text-[#5a6a82]/60 focus:outline-none focus:ring-2 focus:ring-[#c4a55a] transition-all`}
            value={formData.phone}
            onChange={(e) => {
              const val = e.target.value
              const digitsOnly = val.replace(/\D/g, '')
              setPhoneError(val !== digitsOnly || digitsOnly.length > 10 ? 'Please enter 10 digits only' : '')
              setFormData({ ...formData, phone: digitsOnly.slice(0, 10) })
            }}
          />
          {phoneError && <p className="text-red-500 text-xs mt-1 text-left">{phoneError}</p>}
        </div>
        <button
          disabled={loading}
          className="w-full py-3 gradient-gold text-white font-semibold rounded-xl shadow-lg shadow-[#c4a55a]/20 hover:scale-105 transition-premium disabled:opacity-70"
        >
          {loading ? 'Unlocking...' : 'Unlock This Guide'}
        </button>
        <p className="text-xs text-[#5a6a82]/70">Your information is kept 100% confidential.</p>
      </form>
    </div>
  )
}

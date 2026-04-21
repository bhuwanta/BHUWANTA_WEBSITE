'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import logoImg from '@/images/logo.png'

export function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    budget: '',
  })

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          sourcePage: 'Website',
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => setIsOpen(false), 3000)
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Compact Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-sm bg-white rounded-xl shadow-xl overflow-hidden"
      >
        {/* Header — Logo centered, company name in gold below */}
        <div className="bg-[#002935] px-6 pt-5 pb-5 flex flex-col items-center text-center relative">
          {/* Close button — visible on navy */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-3 right-3 p-1.5 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <Image src={logoImg} alt="Bhuwanta" width={56} height={56} className="w-14 h-14 object-contain mb-3" />
          <p className="text-[#BA9832] text-sm font-bold tracking-[0.2em] uppercase">BHUWANTA</p>
          <p className="text-white/50 text-[11px] mt-1 tracking-wide">Schedule a Site Visit</p>
        </div>

        {/* Form / Success */}
        <div className="px-6 py-5">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <input
                  required
                  type="text"
                  placeholder="Full Name *"
                  className="w-full px-3 py-2.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-lg text-sm text-[#002935] placeholder:text-[#002935]/30 focus:outline-none focus:border-[#002935]/30 transition-colors"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <input
                  required
                  type="tel"
                  placeholder="Phone Number *"
                  className="w-full px-3 py-2.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-lg text-sm text-[#002935] placeholder:text-[#002935]/30 focus:outline-none focus:border-[#002935]/30 transition-colors"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />

                <input
                  required
                  type="email"
                  placeholder="Email *"
                  className="w-full px-3 py-2.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-lg text-sm text-[#002935] placeholder:text-[#002935]/30 focus:outline-none focus:border-[#002935]/30 transition-colors"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />

                <input
                  required
                  type="text"
                  placeholder="Approx. Budget *"
                  className="w-full px-3 py-2.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-lg text-sm text-[#002935] placeholder:text-[#002935]/30 focus:outline-none focus:border-[#002935]/30 transition-colors"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                />

                <button
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#002935] text-white text-sm font-medium rounded-lg hover:bg-[#003d4f] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {isSubmitting ? 'Submitting...' : 'Book Visit'}
                </button>

                <p className="text-[10px] text-center text-[#002935]/30">
                  Your information is kept confidential.
                </p>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-[#002935] mb-1">You&apos;re all set!</p>
                <p className="text-xs text-[#002935]/50">We&apos;ll contact you shortly.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

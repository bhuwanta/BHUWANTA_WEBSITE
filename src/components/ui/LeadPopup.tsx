'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import logoImg from '@/images/logo.png'

const WHATSAPP_NUMBER = '919666504405'
const SESSION_KEY = 'bhuwanta_lead_popup_shown'

export function LeadPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '' })

  const trigger = useCallback(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, '1')
    setIsOpen(true)
  }, [])

  // One popup per session, triggered by exit-intent (desktop) or 70% scroll
  // depth (any device) — whichever fires first. Never on first pageview,
  // never repeating within the same session (including after a refresh).
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger()
    }

    const handleScroll = () => {
      const scrolled = window.scrollY + window.innerHeight
      const total = document.documentElement.scrollHeight
      if (total > 0 && scrolled / total >= 0.7) trigger()
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [trigger])

  // Handle background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.phone.length !== 10) {
      setPhoneError('Please enter a valid 10-digit number')
      return
    }
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          enquiryType: 'Pricing Details',
          sourcePage: 'Exit Intent Popup',
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

  const waMessage = encodeURIComponent('Hi Bhuwanta, I would like to know today\'s investor pricing.')
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="bg-[#002935] px-6 py-6 flex flex-col items-center justify-center text-center relative shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <Image
            src={logoImg}
            alt="Bhuwanta"
            width={320}
            height={120}
            loading="lazy"
            className="w-56 sm:w-72 h-auto max-h-24 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
            style={{ height: 'auto' }}
            sizes="(max-width: 640px) 224px, 288px"
          />
        </div>

        <div className="px-6 py-6 sm:py-7">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <h3 className="text-lg sm:text-xl font-bold text-[#002935] text-center mb-1">
                  Get Today&apos;s Investor Pricing
                </h3>
                <p className="text-sm text-[#002935]/60 text-center mb-5">On WhatsApp — no obligation.</p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    required
                    type="text"
                    placeholder="Full Name *"
                    aria-label="Full Name"
                    className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-sm text-[#002935] placeholder:text-[#002935]/40 focus:outline-none focus:ring-2 focus:ring-[#002935]/20 focus:border-[#002935]/50 transition-all"
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
                      className={`w-full px-4 py-3 bg-[#f8f9fb] border ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-[#e8ecf2] focus:ring-[#002935]/20'} rounded-xl text-sm text-[#002935] placeholder:text-[#002935]/40 focus:outline-none focus:ring-2 focus:border-[#002935]/50 transition-all`}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value
                        const digitsOnly = val.replace(/\D/g, '')
                        setPhoneError(val !== digitsOnly || digitsOnly.length > 10 ? 'Please enter 10 digits only' : '')
                        setFormData({ ...formData, phone: digitsOnly.slice(0, 10) })
                      }}
                    />
                    {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 bg-[#002935] text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-[#003d4f] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get Investor Pricing'}
                  </button>
                </form>

                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-[#e8ecf2] flex-1" />
                  <span className="text-xs text-[#002935]/40 font-medium">OR</span>
                  <div className="h-px bg-[#e8ecf2] flex-1" />
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Chat on WhatsApp Instead
                </a>

                <p className="text-[11px] text-center text-[#002935]/40 mt-3 font-medium">
                  Your information is kept 100% confidential.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-10"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#002935] mb-2">You&apos;re all set!</h3>
                <p className="text-sm text-[#002935]/60">Our team will be in touch with today&apos;s investor pricing shortly.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

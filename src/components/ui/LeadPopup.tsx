'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, CheckCircle2, IndianRupee, User, Phone, Mail, Building2, ChevronRight } from 'lucide-react'

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
    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Lock body scroll when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interest: 'General Inquiry',
          message: `Premium Lead Popup. Budget: ${formData.budget}`,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        setTimeout(() => {
          setIsOpen(false)
        }, 4000)
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
        className="absolute inset-0 bg-[#002935]/80 backdrop-blur-md"
      />

      {/* Premium Vertical Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,41,53,0.3)] overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
      >
        {/* Subtle Gold Accents */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#BA9832] via-[#E4C87F] to-[#BA9832] z-30" />
        
        {/* Close Button - positioned in the dark header area */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-5 right-5 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-all z-40 group"
          aria-label="Close"
        >
          <X className="w-5 h-5 transition-transform group-hover:rotate-90" />
        </button>

        {/* Top Visual Header */}
        <div className="bg-[#002935] p-8 pt-10 relative overflow-hidden flex flex-col items-center text-center shrink-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-[#BA9832]/20 border border-[#BA9832]/30 flex items-center justify-center mb-4 mx-auto shadow-lg">
              <Building2 className="w-7 h-7 text-[#BA9832]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              Schedule Site Visit
            </h2>
            <p className="text-white/60 text-sm">
              Experience luxury living firsthand.
            </p>
          </div>
        </div>

        {/* Form Side - Scrollable if needed */}
        <div className="p-6 sm:p-8 bg-white overflow-y-auto custom-scrollbar flex-1">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-[#BA9832] uppercase tracking-widest mb-1.5 block ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]/40 group-focus-within:text-[#BA9832] transition-colors" />
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-[#002935] placeholder:text-[#5a6a82]/30 focus:bg-white focus:border-[#BA9832] focus:ring-4 focus:ring-[#BA9832]/5 focus:outline-none transition-all shadow-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-[#BA9832] uppercase tracking-widest mb-1.5 block ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]/40 group-focus-within:text-[#BA9832] transition-colors" />
                      <input
                        required
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-[#002935] placeholder:text-[#5a6a82]/30 focus:bg-white focus:border-[#BA9832] focus:ring-4 focus:ring-[#BA9832]/5 focus:outline-none transition-all shadow-sm"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-[#BA9832] uppercase tracking-widest mb-1.5 block ml-1">Email (Optional)</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]/40 group-focus-within:text-[#BA9832] transition-colors" />
                      <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-[#002935] placeholder:text-[#5a6a82]/30 focus:bg-white focus:border-[#BA9832] focus:ring-4 focus:ring-[#BA9832]/5 focus:outline-none transition-all shadow-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="relative group">
                    <label className="text-[10px] font-bold text-[#BA9832] uppercase tracking-widest mb-1.5 block ml-1">Approx. Budget</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5a6a82]/40 group-focus-within:text-[#BA9832] transition-colors" />
                      <input
                        required
                        type="text"
                        placeholder="e.g. 50 Lakhs"
                        className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-[#002935] placeholder:text-[#5a6a82]/30 focus:bg-white focus:border-[#BA9832] focus:ring-4 focus:ring-[#BA9832]/5 focus:outline-none transition-all shadow-sm"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    disabled={isSubmitting}
                    className="w-full group mt-6 flex items-center justify-center gap-3 px-8 py-4 bg-[#002935] text-white rounded-xl font-bold hover:bg-[#003d4f] transition-all transform active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-[#002935]/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirm Booking
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  
                  <p className="text-[10px] text-center text-[#5a6a82]/60 uppercase tracking-widest font-bold mt-4">
                    Strictly Confidential & Secure
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-[#BA9832]/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 rounded-full border-4 border-[#BA9832]/20 animate-ping"
                  />
                  <CheckCircle2 className="w-10 h-10 text-[#BA9832]" />
                </div>
                <h3 className="text-2xl font-bold text-[#002935] mb-3">You're All Set!</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">
                  Our luxury property concierge will contact you shortly to confirm your visit.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

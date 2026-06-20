'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Download } from 'lucide-react'
import Image from 'next/image'
import logoImg from '@/images/logo.png'

interface DownloadPopupProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projectName: string
  documentType: string
}

export function DownloadPopup({ isOpen, onClose, onSuccess, projectName, documentType }: DownloadPopupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  })

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false)
      setIsSubmitting(false)
      setFormData({ name: '', phone: '', email: '' })
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
          project: projectName,
          enquiryType: `Document Download: ${documentType}`,
          message: `Requested to download ${documentType} for ${projectName}`,
          sourcePage: 'Website Document Download',
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Trigger the download callback immediately
        onSuccess()
        // Close the popup after a brief success message
        setTimeout(() => onClose(), 3000)
      }
    } catch (error) {
      console.error('Submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
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
        {/* Header */}
        <div className="bg-[#002935] px-6 py-6 flex flex-col items-center justify-center text-center relative shrink-0">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-all z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Logo */}
          <Image 
            src={logoImg} 
            alt="Bhuwanta" 
            width={320} 
            height={120} 
            loading="lazy"
            className="w-40 sm:w-48 h-auto max-h-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] mb-4" 
            style={{ height: 'auto' }}
            sizes="(max-width: 640px) 160px, 192px"
          />
          <h2 className="text-white font-semibold text-lg sm:text-xl">Download {documentType}</h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">{projectName}</p>
        </div>

        {/* Form / Success States */}
        <div className="px-6 py-6 sm:py-7">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-[#002935]/70">Please enter your details to access this document.</p>
                </div>
                <div className="space-y-3">
                  <input
                    required
                    type="text"
                    placeholder="Full Name *"
                    aria-label="Full Name"
                    className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-sm text-[#002935] placeholder:text-[#002935]/40 focus:outline-none focus:ring-2 focus:ring-[#002935]/20 focus:border-[#002935]/50 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      required
                      type="tel"
                      placeholder="Phone Number *"
                      aria-label="Phone Number"
                      className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-sm text-[#002935] placeholder:text-[#002935]/40 focus:outline-none focus:ring-2 focus:ring-[#002935]/20 focus:border-[#002935]/50 transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email Address *"
                      aria-label="Email Address"
                      className="w-full px-4 py-3 bg-[#f8f9fb] border border-[#e8ecf2] rounded-xl text-sm text-[#002935] placeholder:text-[#002935]/40 focus:outline-none focus:ring-2 focus:ring-[#002935]/20 focus:border-[#002935]/50 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={isSubmitting}
                    className="w-full py-3 sm:py-3.5 bg-[#c4a55a] text-white text-sm sm:text-base font-semibold rounded-xl hover:bg-[#b59853] hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      <>
                        <Download className="w-4 h-4" /> Get Document
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-[#002935]/40 mt-3 font-medium">
                    Your information is kept 100% confidential.
                  </p>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-10"
              >
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-[#002935] mb-2">Success!</h3>
                <p className="text-sm text-[#002935]/60">Your download should begin automatically.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

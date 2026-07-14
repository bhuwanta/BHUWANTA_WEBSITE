'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { fireLeadConversion } from '@/lib/gtag'

const WHATSAPP_NUMBER = '919666504405'

export default function ThankYouPage() {
  const waMessage = encodeURIComponent('Hi Bhuwanta, I just submitted an enquiry on your website — could we speak sooner on WhatsApp?')
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`

  // Reaching this page only happens after a successful form submission
  // (ContactForm redirects here) — fires the shared lead conversion once.
  useEffect(() => {
    fireLeadConversion()
  }, [])

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-white px-4 pt-24">
      <div className="max-w-lg w-full text-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0f1d33] mb-4">Done — We&apos;ve Got Your Enquiry</h1>
        <p className="text-[#5a6a82] mb-10 leading-relaxed">
          Our team will call you within 2 hours during business hours (Mon–Sat, 10 AM–7 PM). Want it faster?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white font-semibold rounded-lg shadow-lg shadow-[#25D366]/20 hover:scale-105 transition-premium"
          >
            Chat With Us on WhatsApp Now
          </a>
          <Link
            href="/projects"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#e8ecf2] text-[#1e3a5f] font-semibold rounded-lg hover:border-[#c4a55a] transition-premium"
          >
            Browse Our Projects
          </Link>
        </div>
      </div>
    </main>
  )
}

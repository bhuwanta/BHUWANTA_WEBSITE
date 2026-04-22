import { Metadata } from 'next'
import { Shield, FileText } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('policies', 'Terms & Privacy', 'Privacy policy and terms of service for Bhuwanta.')
}

export default function PoliciesPage() {
  const lastUpdated = 'April 2026'

  return (
    <main className="min-h-screen bg-[#f8f9fb] pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase">Legal</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#002935] mb-4">Terms & Privacy</h1>
          <p className="text-sm text-[#5a6a82]">Last updated: {lastUpdated}</p>
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <a href="#privacy" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-[#e8ecf2] hover:border-[#7D651F]/30 transition-premium group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#7D651F]/10 flex items-center justify-center text-[#7D651F] group-hover:scale-110 transition-premium">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#002935]">Privacy Policy</h3>
              <p className="text-xs text-[#5a6a82]">How we protect your data</p>
            </div>
          </a>
          <a href="#terms" className="flex items-center gap-4 p-6 bg-white rounded-2xl border border-[#e8ecf2] hover:border-[#7D651F]/30 transition-premium group shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#002935]/5 flex items-center justify-center text-[#002935] group-hover:scale-110 transition-premium">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#002935]">Terms of Service</h3>
              <p className="text-xs text-[#5a6a82]">Conditions of use</p>
            </div>
          </a>
        </div>

        <div className="space-y-12">
          {/* Privacy Policy */}
          <section id="privacy" className="bg-white rounded-3xl p-8 md:p-12 border border-[#e8ecf2] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="w-5 h-5 text-[#7D651F]" />
              <h2 className="text-2xl font-bold text-[#002935]">Privacy Policy</h2>
            </div>

            <div className="space-y-6 text-sm text-[#5a6a82] leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">1. Information We Collect</h3>
                <p>We collect only the information you voluntarily provide through our contact forms — your name, email, phone number, and message. We do not collect data without your knowledge.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">2. How We Use It</h3>
                <p>Your information is used solely to respond to your enquiries and provide requested services related to our properties. We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">3. Data Protection</h3>
                <p>We use industry-standard security measures to protect your personal information from unauthorised access, alteration, or disclosure.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">4. Cookies</h3>
                <p>This website may use cookies to improve your browsing experience. You can disable cookies through your browser settings at any time.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">5. Your Rights</h3>
                <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us.</p>
              </div>
            </div>
          </section>

          {/* Terms of Service */}
          <section id="terms" className="bg-white rounded-3xl p-8 md:p-12 border border-[#e8ecf2] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-5 h-5 text-[#002935]" />
              <h2 className="text-2xl font-bold text-[#002935]">Terms of Service</h2>
            </div>

            <div className="space-y-6 text-sm text-[#5a6a82] leading-relaxed">
              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">1. Acceptance</h3>
                <p>By accessing this website, you agree to these terms. If you do not agree, please do not use this site.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">2. Intellectual Property</h3>
                <p>All content on this website — including text, images, logos, and design — is the property of Bhuwanta. Reproduction without written permission is prohibited.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">3. Property Information</h3>
                <p>Property details, pricing, and availability are indicative and subject to change without prior notice. Nothing on this site constitutes a binding offer or contract.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">4. Limitation of Liability</h3>
                <p>Bhuwanta shall not be held liable for any loss or damage arising from the use of this website or reliance on the information provided.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#002935] mb-2">5. Governing Law</h3>
                <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in the applicable state.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-[#5a6a82]">
            Have questions? <a href="/contact" className="text-[#7D651F] font-semibold hover:underline">Contact us</a>.
          </p>
        </div>
      </div>
    </main>
  )
}

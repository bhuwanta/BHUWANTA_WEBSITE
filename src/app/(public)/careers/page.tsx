import { Metadata } from 'next'
import { Mail, CheckCircle, Heart } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, careersQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('careers', 'Careers', 'Join the Bhuwanta team. We\'re building something from the ground up — if you\'re driven, honest, and excited about real estate done right, we\'d love to hear from you.')
}

export const revalidate = 300

const fallback = {
  pageHeading: 'Join the Bhuwanta Team',
  pageSubheading: "We're building something from the ground up — quite literally. If you're driven, honest, and excited about real estate done right, we'd love to hear from you.",
  bodyText: "Bhuwanta is a growing company and we're always open to connecting with talented people. Whether you're an experienced real estate professional or someone ready to learn, reach out.",
  whatWeLookFor: [
    'Integrity above everything',
    'A customer-first mindset',
    'Willingness to learn and grow',
    "Passion for Hyderabad's real estate market",
  ],
  applyEmail: 'info@bhuwanta.com',
  footerNote: 'We will get back to every applicant personally. No automated rejections.',
}

export default async function CareersPage() {
  let data = fallback
  try {
    const sanityData = await sanityFetch<typeof fallback>({ query: careersQuery, tags: ['careers'] })
    if (sanityData) data = { ...fallback, ...sanityData }
  } catch { /* fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Careers', url: `${siteUrl}/careers` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Careers</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            {data.pageHeading}
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            {data.pageSubheading}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-3xl mx-auto">
          {/* Body Text */}
          <div className="mb-12">
            <p className="text-[#5a6a82] leading-relaxed text-lg">
              {data.bodyText}
            </p>
          </div>

          {/* What We Look For */}
          <div className="bg-[#f8f9fb] rounded-2xl p-8 sm:p-10 border border-[#e8ecf2] mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#BA9832]/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#BA9832]" />
              </div>
              <h2 className="text-xl font-bold text-[#002935]">What We Look For</h2>
            </div>
            <div className="space-y-3">
              {(data.whatWeLookFor || fallback.whatWeLookFor).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#e8ecf2]">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-[#002935] font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Apply CTA */}
          <div className="bg-[#002935] rounded-2xl p-8 sm:p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-7 h-7 text-[#BA9832]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">To Apply</h2>
            <p className="text-white/70 mb-6 max-w-lg mx-auto">
              Send your resume and a short note about yourself to:
            </p>
            <a
              href={`mailto:${data.applyEmail}?subject=Career Opportunity`}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
            >
              <Mail className="w-4 h-4" />
              {data.applyEmail}
            </a>
            <p className="text-white/50 text-sm mt-4">
              Subject line: Career Opportunity — [Your Name]
            </p>
          </div>

          {/* Footer Note */}
          {data.footerNote && (
            <div className="text-center mt-8">
              <p className="text-sm text-[#5a6a82] italic">{data.footerNote}</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

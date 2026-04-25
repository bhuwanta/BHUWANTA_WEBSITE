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
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 section-padding relative overflow-hidden bg-[#002935] luxury-bg-grid-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7D651F]/10 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#7D651F] text-xs font-semibold tracking-widest uppercase mb-6 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D651F] shadow-[0_0_8px_#7D651F] animate-pulse" />
            Careers
          </span>
        </div>
      </section>
    </>
  )
}

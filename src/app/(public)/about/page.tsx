import { Metadata } from 'next'
import { Eye, Target, ShieldCheck, Scale, FileCheck, CheckCircle } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, aboutQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('about', 'About Us', 'Learn about Bhuwanta — a Hyderabad-based land development company built on transparency, legal clarity, and Vastu-aligned plot communities.')
}

export const revalidate = 300

const fallback = {
  whoWeAreHeading: 'We Are Bhuwanta',
  whoWeAreBody: `Bhuwanta is a Hyderabad-based land development company built on a single, non-negotiable principle: every buyer deserves complete transparency, legal clarity, and a plot they can be proud to own.\n\nFounded by professionals with deep roots in Hyderabad's real estate sector, Bhuwanta was born out of a simple frustration — too many buyers were misled, confused, or left without proper documentation after land purchases. We exist to change that.\n\nWe develop HMDA-approved, Vastu-aligned plot communities across Hyderabad's high-growth corridors — giving families the foundation to build their dream homes, and investors the security of a trusted, appreciating asset.`,
  visionHeading: 'Our Vision',
  visionBody: 'To make land ownership in Hyderabad simple, trustworthy, and genuinely life-changing — for first-time buyers, seasoned investors, and NRI families finding their way home.',
  missionHeading: 'Our Mission',
  missionBody: 'At Bhuwanta, everything we do is guided by three commitments:',
  missionCommitments: [
    { title: 'Legal First, Always', description: 'We only develop plots with complete HMDA approval, clear title, and full documentation — before a single plot is offered for sale.' },
    { title: 'Vastu by Design', description: 'Every master layout is planned in consultation with certified Vastu experts, so the land you buy is aligned for harmony, health, and prosperity.' },
    { title: 'Total Transparency', description: 'No hidden charges. No jargon. No pressure. You will know every cost, every document, and every detail — before you sign anything.' },
  ],
  whyChooseHeading: 'What Makes Us Different',
  differentiators: [
    { title: 'Legal Clarity from Day One', description: 'Every project carries full HMDA approval and clear title documentation. You will never wonder about the legal status of your investment.' },
    { title: 'Vastu-Certified Master Layouts', description: "Our layouts aren't an afterthought — they're designed alongside Vastu experts from the ground up." },
    { title: 'Zero Hidden Charges', description: 'Our pricing is flat and disclosed upfront. What we quote is what you pay — nothing added at the last minute.' },
    { title: 'Real People, Real Support', description: "From your first site visit to the day of registration, our team is with you every step of the way. We don't disappear after the sale." },
  ],
  legalHeading: 'Our Legal Commitments',
  legalBody: 'We believe trust is built on paper, not just promises. Before any project goes live, Bhuwanta ensures:',
  legalCommitments: [
    'Full HMDA Layout Approval in place',
    'Encumbrance-free, clear title on all land',
    'RERA registration completed and published',
    'All link documents available for buyer review',
    'Independent legal verification completed',
  ],
  closingLine: 'Bhuwanta. Built on trust. Built on land.',
  closingContact: '📞 [PHONE NUMBER]  |  ✉️ info@bhuwanta.com',
}

export default async function AboutPage() {
  let data = fallback
  try {
    const sanityData = await sanityFetch<typeof fallback>({ query: aboutQuery, tags: ['about'] })
    if (sanityData) data = { ...fallback, ...sanityData }
  } catch { /* Use fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* 1. Who We Are */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 section-padding relative overflow-hidden bg-[#002935] luxury-bg-grid-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#BA9832]/10 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#BA9832] text-xs font-semibold tracking-widest uppercase mb-6 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA9832] shadow-[0_0_8px_#BA9832] animate-pulse" />
            Company Overview
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white leading-tight luxury-heading">
            {data.whoWeAreHeading}
          </h1>
          <div className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed text-left space-y-4">
            {(data.whoWeAreBody || '').split('\n').filter(Boolean).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </section>

      {/* 2 & 3. Vision & Mission */}
      <section className="section-padding py-24 bg-white relative luxury-bg-topography">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Vision */}
            <div className="bg-[#f8f9fb] rounded-3xl p-10 lg:p-14 border border-[#e8ecf2] transition-premium hover:shadow-xl hover:border-[#BA9832]/30 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#BA9832]/10 flex items-center justify-center mb-8">
                <Eye className="w-7 h-7 text-[#BA9832]" />
              </div>
              <h2 className="text-3xl font-bold text-[#002935] mb-6">{data.visionHeading}</h2>
              <p className="text-[#5a6a82] leading-relaxed text-lg">
                {data.visionBody}
              </p>
            </div>

            {/* Mission */}
            <div className="bg-[#002935] rounded-3xl p-10 lg:p-14 border border-[#003d4f] transition-premium hover:shadow-xl hover:border-[#BA9832]/50 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                <Target className="w-7 h-7 text-[#BA9832]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">{data.missionHeading}</h2>
              <p className="text-white/70 leading-relaxed mb-6">
                {data.missionBody}
              </p>
              <div className="space-y-4">
                {(data.missionCommitments || fallback.missionCommitments).map((item, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-sm font-bold text-[#BA9832] mb-1">{i + 1}. {item.title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What Makes Us Different */}
      <section className="section-padding py-24 bg-[#f8f9fb] luxury-bg-grid">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase block luxury-subheading">The Bhuwanta Advantage</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#002935] luxury-heading">{data.whyChooseHeading}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(data.differentiators || fallback.differentiators).map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-[#e8ecf2] hover:border-[#BA9832]/30 transition-premium group hover:shadow-lg">
                <div className="flex gap-6 items-start">
                  <div className="flex-shrink-0">
                    <span className="text-4xl font-bold text-[#002935]/10 group-hover:text-[#BA9832]/40 transition-colors duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#002935] mb-3">{item.title}</h3>
                    <p className="text-[#5a6a82] leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Legal Transparency */}
      <section className="section-padding py-24 bg-[#002935] relative luxury-bg-grid-white" id="legal">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Scale className="w-7 h-7 text-[#BA9832]" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 luxury-heading">{data.legalHeading}</h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {data.legalBody}
            </p>
          </div>

          <div className="space-y-3">
            {(data.legalCommitments || fallback.legalCommitments).map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#BA9832]/30 transition-premium">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-white/50 text-sm mt-8">
            You are welcome to have your own lawyer review any document we provide. We welcome it.
          </p>
        </div>
      </section>

      {/* 6. Closing */}
      <section className="section-padding py-32 bg-white relative text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#BA9832]/10 flex items-center justify-center mx-auto mb-8 relative">
            <span className="w-3 h-3 rounded-full bg-[#BA9832] animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-[#BA9832] relative" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#002935] mb-6 luxury-heading">
            {data.closingLine}
          </h2>
          <p className="text-lg text-[#5a6a82] mb-10">
            {data.closingContact}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 lg:py-5 border border-transparent text-sm lg:text-base font-bold rounded-xl text-white gradient-gold hover:opacity-90 shadow-[0_0_20px_rgba(186,152,50,0.3)] hover:shadow-[0_0_30px_rgba(186,152,50,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-widest w-full sm:w-auto"
          >
            Book a Site Visit
          </Link>
        </div>
      </section>
    </>
  )
}

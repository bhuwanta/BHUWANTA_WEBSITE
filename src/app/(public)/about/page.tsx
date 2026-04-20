import { Metadata } from 'next'
import { Target, Eye, Diamond, ShieldCheck, Heart, Medal } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, aboutQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildPersonSchema } from '@/components/seo/JsonLd'
import Link from 'next/link'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('about', 'About Us', 'Learn about Bhuwanta — our story, vision, mission, core values, and the leadership behind premium real estate solutions.')
}

export const revalidate = 300

const fallbackTeam = [
  { name: 'Sanjith Reddy', role: 'Managing Director', bio: 'Over 20 years of experience in real estate development and project management. A visionary leader dedicated to transforming the urban landscape.' },
  { name: 'Aarav Kumar', role: 'Chief Architect', bio: 'Award-winning architect with a passion for sustainable, modern, and highly functional luxury design paradigms.' },
  { name: 'Meera Rao', role: 'VP of Sales & Strategy', bio: 'Expert in client relations and market dynamics with a track record of delivering exceptional customer experiences.' },
]

export default async function AboutPage() {
  let data = {
    teamMembers: fallbackTeam,
  }

  try {
    const sanityData = await sanityFetch<typeof data>({ query: aboutQuery, tags: ['about'] })
    if (sanityData?.teamMembers) data.teamMembers = sanityData.teamMembers
  } catch { /* Use fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ])

  const teamSchemas = (data.teamMembers || fallbackTeam).map((member) =>
    buildPersonSchema({ name: member.name, jobTitle: member.role })
  )

  return (
    <>
      <JsonLd data={[breadcrumb, ...teamSchemas]} />

      {/* 1. About Us (Company Overview) */}
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 section-padding relative overflow-hidden bg-[#002935]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#BA9832]/10 rounded-full blur-[150px]" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#BA9832] text-xs font-semibold tracking-widest uppercase mb-6 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA9832] shadow-[0_0_8px_#BA9832] animate-pulse" />
            Company Overview
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-8 text-white leading-tight">
            Pioneering the standard of<br />
            <span className="text-gradient">Luxury Real Estate</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Founded on the principles of architectural brilliance, undeniable quality, and unparalleled customer trust. Bhuwanta emerges as the benchmark for luxury living spaces, transforming cityscapes into premium landmarks. We construct more than homes; we build legacies.
          </p>
        </div>
      </section>

      {/* 2 & 3. Vision & Mission */}
      <section className="section-padding py-24 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
            {/* Vision */}
            <div className="bg-[#f8f9fb] rounded-3xl p-10 lg:p-14 border border-[#e8ecf2] transition-premium hover:shadow-xl hover:border-[#BA9832]/30 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#BA9832]/10 flex items-center justify-center mb-8">
                <Eye className="w-7 h-7 text-[#BA9832]" />
              </div>
              <h2 className="text-3xl font-bold text-[#002935] mb-6">Our Vision</h2>
              <p className="text-[#5a6a82] leading-relaxed text-lg">
                To be the most trusted and globally recognized real estate developer known for redefining luxury, innovating sustainable living, and creating architectural landmarks that stand the test of time.
              </p>
            </div>
            
            {/* Mission */}
            <div className="bg-[#002935] rounded-3xl p-10 lg:p-14 border border-[#003d4f] transition-premium hover:shadow-xl hover:border-[#BA9832]/50 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8">
                <Target className="w-7 h-7 text-[#BA9832]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-white/70 leading-relaxed text-lg">
                To deliver world-class properties that consistently exceed client expectations in quality, design, and timely execution. We are committed to transparency, customer-centricity, and building communities where people thrive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Values */}
      <section className="section-padding py-24 bg-[#f8f9fb]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase block">Guiding Principles</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#002935]">Our Core Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Diamond, title: 'Uncompromising Quality', desc: 'Sourcing the finest materials and employing top-tier craftsmen for every project.' },
              { icon: ShieldCheck, title: 'Total Transparency', desc: 'Maintaining absolute clarity in communication, pricing, and project milestones.' },
              { icon: Heart, title: 'Customer First', desc: 'Every blueprint is designed around the lifestyle, comfort, and safety of our residents.' },
              { icon: Medal, title: 'Constant Innovation', desc: 'Pushing the boundaries of modern architecture and eco-friendly sustainability.' },
            ].map((val) => (
              <div key={val.title} className="bg-white rounded-2xl p-8 border border-[#e8ecf2] hover:border-[#BA9832]/30 transition-premium group hover:shadow-lg">
                <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <val.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#002935] mb-4">{val.title}</h3>
                <p className="text-[#5a6a82] leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why Choose Us (The Advantage) */}
      <section className="section-padding py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2">
              <span className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase block">The Bhuwanta Advantage</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#002935] mb-8 leading-tight">
                Why thousands trust us to build their homes.
              </h2>
              <div className="space-y-8">
                {[
                  { num: '01', title: 'Prime Locations', desc: 'We strategically select highly appreciating landscapes that offer incredible ROI and peerless convenience.' },
                  { num: '02', title: 'On-Time Delivery', desc: 'A flawless track record of handing over projects strictly within the promised timeframes.' },
                  { num: '03', title: 'Premium Amenities', desc: 'World-class clubhouses, infinity pools, and smart-home integrated ecosystems as a standard.' },
                ].map((item) => (
                  <div key={item.num} className="flex gap-6 group">
                    <div className="flex-shrink-0">
                      <span className="text-4xl font-bold text-[#002935]/10 group-hover:text-[#BA9832]/40 transition-colors duration-500">{item.num}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#002935] mb-2">{item.title}</h3>
                      <p className="text-[#5a6a82] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-[#f3f5f8] shadow-2xl">
                {/* Temporary Image Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#002935] to-transparent z-10 opacity-60" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#5a6a82] bg-[#e8ecf2] p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg mb-4">
                    <Target className="w-8 h-8 text-[#BA9832]" />
                  </div>
                  <span className="font-semibold text-[#002935]">High-Quality Project Demo Image</span>
                  <span className="text-sm mt-2">Replace in CMS or codebase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Leadership & Team */}
      <section className="section-padding py-24 bg-[#002935] relative" id="team">
        <div className="absolute inset-0 bg-center opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase">The Visionaries</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">Meet Our Leadership</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data.teamMembers || fallbackTeam).map((member, i) => (
              <div key={i} className="bg-[#003d4f]/30 rounded-2xl overflow-hidden group transition-premium hover:shadow-2xl border border-white/5 hover:border-[#BA9832]/30 backdrop-blur-sm">
                <div className="aspect-[4/5] relative bg-gradient-to-br from-[#001f28] to-[#003d4f]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_20px_rgba(186,152,50,0.5)]">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{member.name}</h3>
                  <p className="text-sm font-semibold text-[#BA9832] tracking-wider uppercase mb-4">{member.role}</p>
                  <p className="text-white/70 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Get in Touch / Book your Slot */}
      <section className="section-padding py-32 bg-white relative text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#BA9832]/10 flex items-center justify-center mx-auto mb-8">
            <span className="w-3 h-3 rounded-full bg-[#BA9832] animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-[#BA9832] relative" />
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#002935] mb-6">Let's Work Together</h2>
          <p className="text-lg text-[#5a6a82] mb-10 leading-relaxed">
            Ready to discover the future of luxury living? Step into a world of elegance and unmatched quality. Connect with our dedicated sales executives today to schedule an exclusive site visit.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center px-10 py-4 lg:py-5 border border-transparent text-sm lg:text-base font-bold rounded-xl text-white gradient-gold hover:opacity-90 shadow-[0_0_20px_rgba(186,152,50,0.3)] hover:shadow-[0_0_30px_rgba(186,152,50,0.5)] transition-all duration-300 transform hover:-translate-y-1 uppercase tracking-widest w-full sm:w-auto"
          >
            Book Your Slot
          </Link>
        </div>
      </section>
    </>
  )
}

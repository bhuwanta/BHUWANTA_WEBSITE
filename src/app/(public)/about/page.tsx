import { Metadata } from 'next'
import { Users, Target, Award, Heart } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, aboutQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildPersonSchema } from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('about', 'About Us', 'Learn about Bhuwanta — our story, mission, and the team behind premium real estate solutions.')
}

export const revalidate = 300

const fallbackTeam = [
  { name: 'Director Name', role: 'Managing Director', bio: 'Over 20 years of experience in real estate development and project management.' },
  { name: 'Architect Name', role: 'Chief Architect', bio: 'Award-winning architect with a passion for sustainable and innovative design.' },
  { name: 'Sales Head', role: 'VP of Sales', bio: 'Expert in client relations with a track record of delivering exceptional customer experiences.' },
]

export default async function AboutPage() {
  let data = {
    companyStory: null,
    missionStatement: 'To transform real estate development by creating landmark properties that set new standards for quality, design, and sustainable living.',
    teamMembers: fallbackTeam,
  }

  try {
    const sanityData = await sanityFetch<typeof data>({ query: aboutQuery, tags: ['about'] })
    if (sanityData) data = { ...data, ...sanityData }
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

      {/* Hero */}
      <section className="pt-32 pb-20 section-padding relative overflow-hidden bg-[#f8f9fb]">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Our Story</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            Building the Future of<br />
            <span className="text-gradient">Real Estate</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto leading-relaxed">
            {data.missionStatement}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Target, label: 'Our Mission', text: 'Deliver world-class properties that exceed expectations in quality and innovation.' },
              { icon: Award, label: 'Excellence', text: 'Every project meets the highest standards of construction and design quality.' },
              { icon: Heart, label: 'Customer First', text: 'Your satisfaction drives every decision we make, from design to delivery.' },
              { icon: Users, label: 'Expert Team', text: 'Industry veterans with decades of combined experience in real estate.' },
            ].map((v) => (
              <div key={v.label} className="glass-card rounded-2xl p-6 transition-premium hover:border-[#BA9832]/30 hover:shadow-lg group">
                <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-premium">
                  <v.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-[#002935] mb-2">{v.label}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section-padding bg-[#f8f9fb]" id="team">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase">The Team</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002935]">Meet Our Leadership</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(data.teamMembers || fallbackTeam).map((member, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden group transition-premium hover:shadow-xl border border-[#e8ecf2] hover:border-[#BA9832]/30">
                <div className="aspect-[4/3] relative bg-gradient-to-br from-[#002935] to-[#003d4f]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center text-2xl font-bold text-white">
                      {member.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-[#002935]">{member.name}</h3>
                  <p className="text-sm text-[#BA9832] mb-3">{member.role}</p>
                  <p className="text-sm text-[#5a6a82] leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

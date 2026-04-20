import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Building } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, projectsQuery, urlFor } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildRealEstateListingSchema } from '@/components/seo/JsonLd'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('projects', 'Our Projects', 'Explore Bhuwanta\'s premium residential and commercial projects — from upcoming to ready-to-move properties.')
}

export const revalidate = 120

const statusColors: Record<string, string> = {
  upcoming: 'bg-[#003d4f]/10 text-[#003d4f] border-[#003d4f]/20',
  'under-construction': 'bg-[#BA9832]/10 text-[#7D651F] border-[#BA9832]/20',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'sold-out': 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  upcoming: 'Upcoming',
  'under-construction': 'Under Construction',
  ready: 'Ready to Move',
  'sold-out': 'Sold Out',
}

export default async function ProjectsPage() {
  let projects: Array<{ name: string; description: string; specs: string; statusText: string; image?: any }> = []

  try {
    const sanityData = await sanityFetch<{ sectionHeading?: string; projectEntries?: typeof projects }>({
      query: projectsQuery,
      tags: ['projects'],
    })
    if (sanityData?.projectEntries) projects = sanityData.projectEntries
  } catch { /* fallback */ }

  // Fallback projects
  if (projects.length === 0) {
    projects = [
      { name: 'Bhuwanta Heights', description: 'Luxury high-rise apartments with panoramic views and world-class amenities.', specs: '2, 3 & 4 BHK | 1200 - 3500 sq.ft', statusText: 'under-construction' },
      { name: 'Bhuwanta Gardens', description: 'Premium villa plots nestled in lush greenery with modern infrastructure.', specs: '1500 - 5000 sq.ft plots', statusText: 'ready' },
      { name: 'Bhuwanta Tower', description: 'Commercial office spaces designed for the modern workforce.', specs: 'Office Spaces | 500 - 10000 sq.ft', statusText: 'upcoming' },
    ]
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Projects', url: `${siteUrl}/projects` },
  ])

  const listingSchemas = projects.map((p) =>
    buildRealEstateListingSchema({
      name: p.name,
      description: p.description,
      url: `${siteUrl}/projects`,
      status: p.statusText,
    })
  )

  return (
    <>
      <JsonLd data={[breadcrumb, ...listingSchemas]} />

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Our Portfolio</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            Premium <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            Discover our carefully curated portfolio of residential and commercial developments.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden group transition-premium border border-[#e8ecf2] hover:border-[#BA9832]/30 hover:shadow-xl hover:scale-[1.01]"
              >
                {/* Image placeholder or actual image */}
                <div className="relative aspect-[16/9] bg-gradient-to-br from-[#002935] to-[#003d4f]">
                  {project.image ? (
                    <img
                      src={urlFor(project.image).url()}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building className="w-16 h-16 text-white/10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.statusText] || 'bg-white/80 text-[#5a6a82] border-[#e8ecf2]'}`}>
                      {statusLabels[project.statusText] || project.statusText}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#002935] mb-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-[#5a6a82] mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-[#5a6a82] mb-4">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#BA9832]" />
                      {project.specs}
                    </span>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#003d4f] hover:text-[#BA9832] transition-premium"
                  >
                    Inquire Now <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

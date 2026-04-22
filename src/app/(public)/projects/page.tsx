import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Phone, MessageCircle } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, projectsQuery, urlFor } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildRealEstateListingSchema } from '@/components/seo/JsonLd'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('projects', 'Our Projects', 'Explore Bhuwanta\'s HMDA-approved, Vastu-aligned plot developments in Hyderabad\'s high-growth corridors.')
}

export const revalidate = 120

const statusColors: Record<string, string> = {
  'registrations-open': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  upcoming: 'bg-[#003d4f]/10 text-[#003d4f] border-[#003d4f]/20',
  'under-development': 'bg-[#BA9832]/10 text-[#7D651F] border-[#BA9832]/20',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'sold-out': 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  'registrations-open': '🟢 Registrations Open',
  upcoming: 'Upcoming',
  'under-development': 'Under Development',
  ready: 'Ready',
  'sold-out': 'Sold Out',
}

interface ProjectEntry {
  name: string
  slug?: { current: string }
  location: string
  description: string
  plotSizes: string
  pricePerSqYd: string
  hmdaLpNumber: string
  reraNumber: string
  statusText: string
  image?: any
  masterLayoutImage?: any
  plotDetails?: Array<{ plotSize: string; area: string; pricePerSqYd: string; totalPrice: string }>
  amenities?: Array<{ icon: string; label: string }>
  locationHighlights?: Array<{ icon: string; label: string }>
  approvals?: Array<{ label: string; detail: string }>
}

export default async function ProjectsPage() {
  let projects: ProjectEntry[] = []
  let pageHeading = 'Our Projects'
  let pageSubheading = 'Every Bhuwanta project is HMDA-approved, Vastu-aligned, and built for long-term value. Explore what\'s available.'

  try {
    const sanityData = await sanityFetch<{ pageHeading?: string; pageSubheading?: string; projectEntries?: ProjectEntry[] }>({
      query: projectsQuery,
      tags: ['projects'],
    })
    if (sanityData?.projectEntries) projects = sanityData.projectEntries
    if (sanityData?.pageHeading) pageHeading = sanityData.pageHeading
    if (sanityData?.pageSubheading) pageSubheading = sanityData.pageSubheading
  } catch { /* fallback */ }

  // Fallback project
  if (projects.length === 0) {
    projects = [
      {
        name: '[PROJECT NAME]',
        location: '[LOCATION], Hyderabad',
        description: 'Bhuwanta\'s debut development — a carefully planned, Vastu-aligned layout in one of Hyderabad\'s fastest-growing zones. Every plot is HMDA-approved, clearly titled, and ready for construction.',
        plotSizes: '150 sq yd – 300 sq yd',
        pricePerSqYd: 'Starting ₹[PRICE] per sq yd',
        hmdaLpNumber: 'LP No. [NUMBER]',
        reraNumber: 'No. [NUMBER]',
        statusText: 'registrations-open',
        amenities: [
          { icon: 'Route', label: 'Wide black-topped internal roads' },
          { icon: 'Zap', label: 'Underground electricity supply' },
          { icon: 'Droplets', label: 'Dedicated water supply line' },
          { icon: 'Trees', label: 'Parks and open green spaces' },
          { icon: 'Building', label: 'Compound wall with gated entry' },
          { icon: 'CloudRain', label: 'Proper drainage system' },
        ],
        locationHighlights: [
          { icon: 'MapPin', label: '[X km] from [MAJOR LANDMARK / HIGHWAY]' },
          { icon: 'GraduationCap', label: '[X km] from [SCHOOL / COLLEGE]' },
          { icon: 'Hospital', label: '[X km] from [HOSPITAL]' },
          { icon: 'ShoppingCart', label: '[X km] from [MARKET / MALL]' },
          { icon: 'Bus', label: '[X km] from [BUS STOP / METRO]' },
        ],
        approvals: [
          { label: 'HMDA Approved', detail: 'LP No. [NUMBER]' },
          { label: 'RERA Registered', detail: 'No. [NUMBER]' },
          { label: 'Clear Title', detail: 'Verified by [LAW FIRM / ADVOCATE NAME]' },
          { label: 'Vastu-Certified', detail: 'By [CONSULTANT NAME]' },
        ],
        plotDetails: [
          { plotSize: 'Standard', area: '[X sq yd]', pricePerSqYd: '₹[PRICE]', totalPrice: '₹[TOTAL]' },
          { plotSize: 'Premium', area: '[X sq yd]', pricePerSqYd: '₹[PRICE]', totalPrice: '₹[TOTAL]' },
          { plotSize: 'Corner', area: '[X sq yd]', pricePerSqYd: '₹[PRICE]', totalPrice: '₹[TOTAL]' },
        ],
      },
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
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb] luxury-bg-grid">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase luxury-subheading">Our Portfolio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935] luxury-heading">
            {pageHeading}
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            {pageSubheading}
          </p>
        </div>
      </section>

      {/* Project Listings */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-5xl mx-auto space-y-16">
          {projects.map((project, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#e8ecf2] shadow-sm">
              {/* Project Header */}
              <div className="relative bg-gradient-to-br from-[#002935] to-[#003d4f] p-8 sm:p-10">
                {project.image && (
                  <img
                    src={urlFor(project.image).url()}
                    alt={project.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-20"
                  />
                )}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[project.statusText] || 'bg-white/80 text-[#5a6a82] border-[#e8ecf2]'}`}>
                      {statusLabels[project.statusText] || project.statusText}
                    </span>
                    {project.hmdaLpNumber && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/20">
                        🏛️ HMDA Approved
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{project.name}</h2>
                  <p className="text-white/70 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#BA9832]" />
                    {project.location}
                  </p>
                </div>
              </div>

              <div className="p-8 sm:p-10 space-y-8">
                {/* Description */}
                <p className="text-[#5a6a82] leading-relaxed">{project.description}</p>

                {/* Key Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#f8f9fb] rounded-xl p-4 border border-[#e8ecf2]">
                    <span className="text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Plot Sizes</span>
                    <p className="text-sm font-medium text-[#002935] mt-1">📐 {project.plotSizes}</p>
                  </div>
                  <div className="bg-[#f8f9fb] rounded-xl p-4 border border-[#e8ecf2]">
                    <span className="text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">Price</span>
                    <p className="text-sm font-medium text-[#002935] mt-1">💰 {project.pricePerSqYd}</p>
                  </div>
                  <div className="bg-[#f8f9fb] rounded-xl p-4 border border-[#e8ecf2]">
                    <span className="text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">HMDA</span>
                    <p className="text-sm font-medium text-[#002935] mt-1">🏛️ {project.hmdaLpNumber}</p>
                  </div>
                </div>

                {/* Plot Details Table */}
                {project.plotDetails && project.plotDetails.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#002935] mb-4">Plot Details</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#f8f9fb] border border-[#e8ecf2]">
                            <th className="text-left px-4 py-3 font-semibold text-[#002935]">Plot Size</th>
                            <th className="text-left px-4 py-3 font-semibold text-[#002935]">Area</th>
                            <th className="text-left px-4 py-3 font-semibold text-[#002935]">Price per sq yd</th>
                            <th className="text-left px-4 py-3 font-semibold text-[#002935]">Total Starting Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.plotDetails.map((row, j) => (
                            <tr key={j} className="border border-[#e8ecf2]">
                              <td className="px-4 py-3 text-[#002935] font-medium">{row.plotSize}</td>
                              <td className="px-4 py-3 text-[#5a6a82]">{row.area}</td>
                              <td className="px-4 py-3 text-[#5a6a82]">{row.pricePerSqYd}</td>
                              <td className="px-4 py-3 text-[#002935] font-semibold">{row.totalPrice}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Amenities */}
                {project.amenities && project.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#002935] mb-4">Amenities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.amenities.map((amenity, j) => (
                        <div key={j} className="flex items-center gap-3 bg-[#f8f9fb] rounded-lg p-3 border border-[#e8ecf2] transition-premium hover:border-[#BA9832]/30 hover:shadow-sm">
                          <span className="text-lg text-[#BA9832]">
                            <DynamicIcon name={amenity.icon} className="w-5 h-5" />
                          </span>
                          <span className="text-sm font-medium text-[#002935]">{amenity.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Highlights */}
                {project.locationHighlights && project.locationHighlights.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#002935] mb-4">Location Highlights</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.locationHighlights.map((highlight, j) => (
                        <div key={j} className="flex items-center gap-3 bg-[#f8f9fb] rounded-lg p-3 border border-[#e8ecf2] transition-premium hover:border-[#003d4f]/30 hover:shadow-sm">
                          <span className="text-lg text-[#003d4f]">
                            <DynamicIcon name={highlight.icon} className="w-5 h-5" />
                          </span>
                          <span className="text-sm font-medium text-[#5a6a82]">{highlight.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approvals */}
                {project.approvals && project.approvals.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-[#002935] mb-4">Approvals & Certifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.approvals.map((approval, j) => (
                        <div key={j} className="flex items-start gap-3 bg-emerald-50/50 rounded-lg p-4 border border-emerald-100">
                          <span className="text-emerald-500 font-bold mt-0.5">✅</span>
                          <div>
                            <span className="text-sm font-semibold text-[#002935]">{approval.label}</span>
                            <span className="text-sm text-[#5a6a82] block">{approval.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-[#002935] rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-bold text-white mb-3">Interested in {project.name}?</h3>
                  <p className="text-white/70 mb-6 text-sm max-w-lg mx-auto">
                    Book a free site visit and walk the land yourself. Our team will guide you through the layout, explain all documents, and answer every question — with zero pressure to buy.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
                    >
                      Book Free Site Visit <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="tel:+91XXXXXXXXXX"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
                    >
                      <Phone className="w-4 h-4" /> Call Now
                    </a>
                    <a
                      href="https://wa.me/91XXXXXXXXXX"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

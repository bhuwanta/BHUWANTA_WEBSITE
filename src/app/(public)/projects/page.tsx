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
  'under-development': 'bg-[#7D651F]/10 text-[#7D651F] border-[#7D651F]/20',
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
      <section className="pt-32 pb-20 sm:pt-40 sm:pb-32 section-padding relative overflow-hidden bg-[#002935] luxury-bg-grid-white">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#7D651F]/10 rounded-full blur-[150px]" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#7D651F] text-xs font-semibold tracking-widest uppercase mb-6 mt-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7D651F] shadow-[0_0_8px_#7D651F] animate-pulse" />
            Projects
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            {pageHeading}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            {pageSubheading}
          </p>
        </div>
      </section>

      <section className="py-24 bg-[#f7f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => (
              <Link href={`/projects/${project.slug?.current || '#'}`} key={idx} className="group block bg-white rounded-2xl overflow-hidden border border-[#e8ecf2] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-[#e8ecf2] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{project.statusText === 'registrations-open' ? 'Registrations Open' : 'HMDA Approved'}</span>
                  </div>
                  {project.image?.asset && (
                    <img
                      src={urlFor(project.image).url()}
                      alt={project.name || 'Project Image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {!project.image?.asset && (
                    <div className="absolute inset-0 bg-[#0f1d33]/5 group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0f1d33] mb-2 group-hover:text-[#1e3a5f] transition-colors">{project.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#5a6a82] mb-4">
                    <MapPin className="w-4 h-4" /> {project.location || 'Hyderabad'}
                  </div>
                  <div className="pt-4 border-t border-[#e8ecf2] flex items-center justify-between text-sm font-semibold text-[#1e3a5f]">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

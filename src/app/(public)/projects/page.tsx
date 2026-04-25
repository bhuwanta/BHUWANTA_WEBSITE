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
        </div>
      </section>
    </>
  )
}

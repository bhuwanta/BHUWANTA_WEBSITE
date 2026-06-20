import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, MapPin, Phone, MessageCircle, Crown, Check, CreditCard, Download } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, projectsQuery, projectCategoriesQuery, urlFor } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildRealEstateListingSchema } from '@/components/seo/JsonLd'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { PageBanner } from '../../../components/ui/PageBanner'
import { CtaSection } from '@/components/ui/CtaSection'
import { ProjectsFilterClient } from '@/components/ui/ProjectsFilterClient'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('projects', 'Our Projects', 'Explore Bhuwanta\'s HMDA-approved, Vastu-aligned plot developments in Hyderabad\'s high-growth corridors.')
}

export const revalidate = 0

const statusColors: Record<string, string> = {
  'registrations-open': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  upcoming: 'bg-[#003d4f]/10 text-[#003d4f] border-[#003d4f]/20',
  'under-development': 'bg-[#B69A4E]/10 text-[#B69A4E] border-[#B69A4E]/20',
  ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'sold-out': 'bg-red-50 text-red-700 border-red-200',
}

const statusLabels: Record<string, string> = {
  'registrations-open': 'Registrations Open',
  upcoming: 'Upcoming',
  'under-development': 'Under Development',
  ready: 'Ready',
  'sold-out': 'Sold Out',
}

interface ProjectEntry {
  name: string
  category?: string
  categoryTitle?: string
  slug?: { current: string }
  location: string
  googleMapsUrl?: string
  plotSizes: string
  images?: string[]
  projectHighlights?: string[]
  brochureUrls?: string[]
  layoutUrls?: string[]
  reraUrls?: string[]
  approvalCertificateLabel?: string
  hmdaDtcpUrls?: string[]
  description: string
}

export default async function ProjectsPage() {
  let projects: ProjectEntry[] = []
  let pageHeading = 'Our Projects'
  let categories: { id: string; title: string; label: string; order?: number }[] = []

  try {
    const sanityData = await sanityFetch<{ pageHeading?: string; projectEntries?: ProjectEntry[] }>({
      query: projectsQuery,
      tags: ['projects'],
    })
    const sanityCategories = await sanityFetch<{ id: string; title: string; label: string; order?: number }[]>({
      query: projectCategoriesQuery,
      tags: ['projectCategory'],
    })
    
    if (sanityCategories) categories = sanityCategories
    if (sanityData?.projectEntries) projects = sanityData.projectEntries.map((p: any) => ({ ...p, description: p.description || '' }))
    if (sanityData?.pageHeading) pageHeading = sanityData.pageHeading
  } catch { /* fallback */ }

  // Fallback project
  if (projects.length === 0) {
    projects = [
      {
        name: '[PROJECT NAME]',
        category: 'warangal-highway',
        location: '[LOCATION], Hyderabad',
        googleMapsUrl: 'https://maps.google.com',
        description: 'Bhuwanta\'s debut development — a carefully planned, Vastu-aligned layout in one of Hyderabad\'s fastest-growing zones. Every plot is HMDA-approved, clearly titled, and ready for construction.',
        plotSizes: '150 sq yd – 300 sq yd',
      }
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
      description: p.description || '',
      url: `${siteUrl}/projects`,
    })
  )

  return (
    <>
      <JsonLd data={[breadcrumb, ...listingSchemas]} />

      <PageBanner 
        title={<>Our <span className="text-[#c4a55a]">Projects</span></>}
      />

      <ProjectsFilterClient projects={projects} categories={categories} />

      <CtaSection />
    </>
  )
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'
import { sanityFetch, projectBySlugQuery, projectSlugsQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildRealEstateListingSchema, buildFaqSchema } from '@/components/seo/JsonLd'
import { PageBanner } from '@/components/ui/PageBanner'
import { CtaSection } from '@/components/ui/CtaSection'
import { ProjectDetailActions } from '@/components/ui/ProjectDetailActions'

interface ProjectDetail {
  name: string
  categoryTitle?: string
  slug: { current: string }
  location: string
  googleMapsUrl?: string
  description: string
  images?: string[]
  videoUrl?: string
  youtubeUrl?: string
  projectHighlights?: string[]
  brochureUrls?: string[]
  layoutUrls?: string[]
  reraUrls?: string[]
  approvalCertificateLabel?: string
  hmdaDtcpUrls?: string[]
  approvalBadge?: string
}

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[]>({ query: projectSlugsQuery, tags: ['projects'] })
    return (slugs || []).map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await sanityFetch<ProjectDetail | null>({
    query: projectBySlugQuery,
    params: { slug },
    tags: ['projects'],
  }).catch(() => null)

  if (!project) return { title: 'Project Not Found' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const title = { absolute: `${project.name} — ${project.location} | Bhuwanta Developers` }
  const description = `${project.name} in ${project.location}${project.approvalBadge ? `, ${project.approvalBadge}` : ''}. ${project.description?.slice(0, 130) || 'Explore plot sizes, approvals, and pricing.'}`

  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/projects/${slug}` },
    openGraph: {
      title: title.absolute,
      description,
      type: 'website',
      ...(project.images?.[0] ? { images: [{ url: project.images[0] }] } : {}),
    },
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await sanityFetch<ProjectDetail | null>({
    query: projectBySlugQuery,
    params: { slug },
    tags: ['projects'],
  }).catch(() => null)

  if (!project) return notFound()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const pageUrl = `${siteUrl}/projects/${slug}`

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Projects', url: `${siteUrl}/projects` },
    { name: project.name, url: pageUrl },
  ])

  const listingSchema = buildRealEstateListingSchema({
    name: project.name,
    description: project.description || '',
    url: pageUrl,
    ...(project.images?.[0] ? { imageUrl: project.images[0] } : {}),
    address: project.location,
  })

  const faqSchema = buildFaqSchema([
    {
      question: `Is ${project.name} RERA registered?`,
      answer: `Yes. ${project.name} is ${project.approvalBadge || 'HMDA/DTCP'} approved and RERA registered, with clear legal documentation available for verification.`,
    },
    {
      question: `Is bank loan financing available for ${project.name}?`,
      answer: `Yes, plots at ${project.name} are eligible for bank loan financing, subject to the lender's standard approval process.`,
    },
    {
      question: `How do I book a site visit to ${project.name}?`,
      answer: `You can book a free site visit to ${project.name} by filling out the enquiry form on this page, or via WhatsApp, and our team will arrange a convenient time.`,
    },
  ])

  return (
    <>
      <JsonLd data={[breadcrumb, listingSchema, faqSchema]} />

      <PageBanner
        title={<>{project.name}</>}
        subtitle={`${project.location}${project.approvalBadge ? ` · ${project.approvalBadge}` : ''}`}
      />

      <section className="py-16 bg-[#f7f8fa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-6 md:p-10">
            <ProjectDetailActions
              name={project.name}
              images={project.images}
              videoUrl={project.videoUrl}
              youtubeUrl={project.youtubeUrl}
              googleMapsUrl={project.googleMapsUrl}
              brochureUrls={project.brochureUrls}
              layoutUrls={project.layoutUrls}
              reraUrls={project.reraUrls}
              hmdaDtcpUrls={project.hmdaDtcpUrls}
              approvalCertificateLabel={project.approvalCertificateLabel}
            />

            {project.description && (
              <p className="mt-8 text-[#5a6a82] leading-relaxed">{project.description}</p>
            )}

            {project.projectHighlights && project.projectHighlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mt-8 pt-8 border-t border-[#e8ecf2] text-sm font-medium text-[#0f1d33]">
                {project.projectHighlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#c4a55a] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white stroke-[3]" />
                    </div>
                    {highlight}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-[#e8ecf2]">
              <h2 className="text-xl font-bold text-[#1e3a5f] mb-4">Frequently Asked Questions</h2>
              <div className="space-y-5">
                <div>
                  <h3 className="font-bold text-[#0f1d33] mb-1">Is {project.name} RERA registered?</h3>
                  <p className="text-sm text-[#5a6a82]">Yes. {project.name} is {project.approvalBadge || 'HMDA/DTCP'} approved and RERA registered, with clear legal documentation available for verification.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1d33] mb-1">Is bank loan financing available?</h3>
                  <p className="text-sm text-[#5a6a82]">Yes, plots at {project.name} are eligible for bank loan financing, subject to the lender&apos;s standard approval process.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#0f1d33] mb-1">How do I book a site visit?</h3>
                  <p className="text-sm text-[#5a6a82]">Fill out the enquiry form on this page or reach us via WhatsApp, and our team will arrange a convenient time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}

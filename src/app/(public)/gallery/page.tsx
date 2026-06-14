import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, galleryQuery } from '@/lib/sanity'
import { extractYouTubeId } from '@/lib/utils'
import { JsonLd, buildBreadcrumbSchema, buildImageGallerySchema } from '@/components/seo/JsonLd'
import { GalleryGrid } from './GalleryGrid'
import { PageBanner } from '../../../components/ui/PageBanner'
import { CtaSection } from '@/components/ui/CtaSection'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('gallery', 'Gallery', 'See the land for yourself. Every photo is real — no renderings, no stock images. Browse site views, layouts, and development progress.')
}

export const revalidate = 120

interface ProjectEntry {
  name?: string
  categoryTitle?: string
  images?: string[]
  videoUrl?: string
  youtubeUrl?: string
}

export default async function GalleryPage() {
  let projects: Array<{
    name: string
    categoryTitle: string | null
    images: string[]
    videoUrl: string | null
    youtubeId: string | null
  }> = []

  try {
    const sanityData = await sanityFetch<{
      projectEntries?: ProjectEntry[]
    }>({ query: galleryQuery, tags: ['projects'] })

    if (sanityData?.projectEntries) {
      projects = sanityData.projectEntries
        .filter((p) => p.name)
        .map((p) => ({
          name: p.name || 'Untitled Project',
          categoryTitle: p.categoryTitle || null,
          images: (p.images || []).filter(Boolean),
          videoUrl: p.videoUrl || null,
          youtubeId: p.youtubeUrl ? extractYouTubeId(p.youtubeUrl) || null : null,
        }))
    }
  } catch (error) {
    console.error("Gallery fetch error:", error)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Gallery', url: `${siteUrl}/gallery` },
  ])

  const allImages = projects.flatMap((p) => p.images)
  const gallerySchema = allImages.length > 0
    ? buildImageGallerySchema(allImages.map(url => ({ url, caption: '' })))
    : null

  return (
    <>
      <JsonLd data={gallerySchema ? [breadcrumb, gallerySchema] : [breadcrumb]} />

      <PageBanner 
        title={<>Our <span className="text-[#c4a55a]">Gallery</span></>} 
      />

      <div className="flex-1 bg-[#f7f8fa]">
        <GalleryGrid projects={projects} />
      </div>

      <CtaSection />
    </>
  )
}

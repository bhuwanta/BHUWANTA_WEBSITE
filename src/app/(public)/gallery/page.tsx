import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, galleryQuery } from '@/lib/sanity'
import { extractYouTubeId } from '@/lib/utils'
import { JsonLd, buildBreadcrumbSchema, buildImageGallerySchema } from '@/components/seo/JsonLd'
import { GalleryGrid } from './GalleryGrid'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { PageBanner } from '../../../components/ui/PageBanner'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('gallery', 'Gallery', 'See the land for yourself. Every photo is real — no renderings, no stock images. Browse site views, layouts, and development progress.')
}

export const revalidate = 120

export default async function GalleryPage() {
  let images: Array<{ id: string; url: string; alt_text: string; category: string }> = []
  let videos: Array<{ id: string; platform: string; video_id: string; title: string }> = []
  let pageHeading = 'On the Ground at Bhuwanta'
  let pageSubheading = 'See the land for yourself. Every photo here is real — no renderings, no stock images.'
  let devUpdateHeading = 'Development Updates'
  let devUpdateBody = "We'll continue to document every milestone as our projects develop — from initial groundwork to road completion and final handover. Bookmark this page and check back for updates."

  try {
    const sanityData = await sanityFetch<{
      pageHeading?: string
      pageSubheading?: string
      images?: { alt?: string; category?: string; asset?: { url?: string } }[]
      youtubeVideos?: { title?: string; url?: string }[]
      devUpdateHeading?: string
      devUpdateBody?: string
    }>({ query: galleryQuery, tags: ['gallery'] })

    if (sanityData) {
      if (sanityData.pageHeading) pageHeading = sanityData.pageHeading
      if (sanityData.pageSubheading) pageSubheading = sanityData.pageSubheading
      if (sanityData.devUpdateHeading) devUpdateHeading = sanityData.devUpdateHeading
      if (sanityData.devUpdateBody) devUpdateBody = sanityData.devUpdateBody

      if (sanityData.images) {
        images = sanityData.images.filter(img => img.asset?.url).map((img, i) => ({
          id: `img-${i}`,
          url: img.asset!.url!,
          alt_text: img.alt || '',
          category: img.category || '',
        }))
      }

      if (sanityData.youtubeVideos) {
        videos = sanityData.youtubeVideos.map((vid, i) => {
          const video_id = extractYouTubeId(vid.url || '')
          return {
            id: `vid-${i}`,
            platform: 'youtube',
            video_id: video_id || '',
            title: vid.title || '',
          }
        }).filter(v => v.video_id !== '')
      }
    }
  } catch (error) {
    console.error("Gallery fetch error:", error)
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Gallery', url: `${siteUrl}/gallery` },
  ])
  const gallerySchema = images.length > 0
    ? buildImageGallerySchema(images.map(img => ({ url: img.url, caption: img.alt_text })))
    : null

  return (
    <>
      <JsonLd data={gallerySchema ? [breadcrumb, gallerySchema] : [breadcrumb]} />

      <PageBanner 
        title="The Bhuwanta Experience" 
      />
    </>
  )
}

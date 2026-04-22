import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, galleryQuery } from '@/lib/sanity'
import { extractYouTubeId } from '@/lib/utils'
import { JsonLd, buildBreadcrumbSchema, buildImageGallerySchema } from '@/components/seo/JsonLd'
import { GalleryGrid } from './GalleryGrid'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

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

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb] luxury-bg-grid">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#7D651F] mb-4 tracking-wider uppercase luxury-subheading">Real Photos</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935] luxury-heading">
            {pageHeading}
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            {pageSubheading}
          </p>
        </div>
      </section>

      {/* Gallery Grid with Filter Tabs */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          {images.length === 0 && videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-[#e8ecf2] shadow-sm">
                <p className="text-[#5a6a82] mb-2">No media available yet.</p>
                <p className="text-sm text-[#5a6a82]/60">Photos and videos will appear here as our projects develop. Add media via Sanity Studio.</p>
              </div>
            </div>
          ) : (
            <GalleryGrid images={images} videos={videos} />
          )}
        </div>
      </section>

      {/* Development Updates */}
      <section className="section-padding bg-[#f8f9fb] luxury-bg-topography" id="dev-updates">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#e8ecf2]">
            <div className="w-12 h-12 rounded-xl bg-[#7D651F]/10 flex items-center justify-center mx-auto mb-6">
              <DynamicIcon name="HardHat" className="w-6 h-6 text-[#7D651F]" />
            </div>
            <h2 className="text-2xl font-bold text-[#002935] mb-4 luxury-heading">{devUpdateHeading}</h2>
            <p className="text-[#5a6a82] leading-relaxed">{devUpdateBody}</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-padding bg-white luxury-bg-topography" id="gallery-cta">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#002935] mb-4 luxury-heading">Want to See It in Person?</h2>
          <p className="text-lg text-[#5a6a82] mb-8 max-w-xl mx-auto">
            A photo only shows so much. Come walk the land yourself — we&apos;ll arrange a free guided site visit at a time that works for you.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
          >
            Book a Site Visit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  )
}

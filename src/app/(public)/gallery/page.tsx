import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, galleryQuery } from '@/lib/sanity'
import { extractYouTubeId } from '@/lib/utils'
import { JsonLd, buildBreadcrumbSchema, buildImageGallerySchema } from '@/components/seo/JsonLd'
import { GalleryGrid } from './GalleryGrid'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('gallery', 'Gallery', 'Explore our stunning portfolio of real estate projects, luxury interiors, and architectural masterpieces.')
}

export const revalidate = 120

export default async function GalleryPage() {
  let images: Array<{ id: string; url: string; alt_text: string; category: string }> = []
  let videos: Array<{ id: string; platform: string; video_id: string; title: string }> = []
  let pageHeading = 'Visual Gallery'

  try {
    const sanityData = await sanityFetch<{ 
      pageHeading?: string,
      images?: { alt?: string, asset?: { url?: string } }[],
      youtubeVideos?: { title?: string, url?: string }[]
    }>({ query: galleryQuery, tags: ['gallery'] })

    if (sanityData) {
      if (sanityData.pageHeading) pageHeading = sanityData.pageHeading

      if (sanityData.images) {
        images = sanityData.images.filter(img => img.asset?.url).map((img, i) => ({
          id: `img-${i}`,
          url: img.asset!.url!,
          alt_text: img.alt || '',
          category: ''
        }))
      }

      if (sanityData.youtubeVideos) {
        videos = sanityData.youtubeVideos.map((vid, i) => {
          const video_id = extractYouTubeId(vid.url || '')
          return {
            id: `vid-${i}`,
            platform: 'youtube',
            video_id: video_id || '',
            title: vid.title || ''
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
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Our Portfolio</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            {pageHeading.split(' ').slice(0, -1).join(' ')}{' '}
            <span className="text-gradient">{pageHeading.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            Browse through our collection of stunning properties, architectural details, and spaces we&apos;ve brought to life.
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          {images.length === 0 && videos.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-[#e8ecf2] shadow-sm">
                <p className="text-[#5a6a82] mb-2">No media available.</p>
                <p className="text-sm text-[#5a6a82]/60">Please add images and videos via your Dashboard.</p>
              </div>
            </div>
          ) : (
            <GalleryGrid images={images} videos={videos} />
          )}
        </div>
      </section>
    </>
  )
}

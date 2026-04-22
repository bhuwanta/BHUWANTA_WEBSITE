import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'
import Link from 'next/link'
import { sanityFetch, blogPostQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildArticleSchema } from '@/components/seo/JsonLd'
import { formatDate, calculateReadingTime } from '@/lib/utils'

interface BlogPostData {
  title: string
  slug: { current: string }
  body: any[]
  tags?: string[]
  publishDate: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  canonicalUrl?: string
  focusKeyword?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await sanityFetch<BlogPostData>({
      query: blogPostQuery,
      params: { slug },
      tags: ['blog'],
    })
    if (!post) return { title: 'Post Not Found' }

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || `Read "${post.title}" on Bhuwanta Blog`,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription,
        type: 'article',
        ...(post.ogImage ? { images: [{ url: post.ogImage }] } : {}),
      },
      ...(post.canonicalUrl ? { alternates: { canonical: post.canonicalUrl } } : {}),
    }
  } catch {
    return { title: 'Blog Post' }
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let post: BlogPostData | null = null

  try {
    post = await sanityFetch<BlogPostData>({
      query: blogPostQuery,
      params: { slug },
      tags: ['blog'],
    })
  } catch { /* not found */ }

  if (!post) return notFound()

  // Estimate reading time from body text
  const bodyText = post.body
    ?.map((block: any) =>
      block.children?.map((c: any) => c.text).join(' ') || ''
    )
    .join(' ') || ''
  const readingTime = calculateReadingTime(bodyText)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${slug}` },
  ])

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.metaDescription || `Read "${post.title}"`,
    url: `${siteUrl}/blog/${slug}`,
    datePublished: post.publishDate,
    authorName: 'Bhuwanta Team',
    publisherName: 'Bhuwanta',
    ...(post.ogImage ? { imageUrl: post.ogImage } : {}),
  })

  return (
    <>
      <JsonLd data={[breadcrumb, articleSchema]} />

      <article className="pt-28 sm:pt-32 section-padding">
        <div className="max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-premium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {readingTime} min read
              </span>
            </div>
          </header>

          {/* Body */}
          <div className="prose prose-lg max-w-none prose-headings:font-bold prose-p:text-[#5a6a82] prose-a:text-[#003d4f] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#002935] prose-blockquote:border-[#7D651F]/50 prose-blockquote:text-[#5a6a82]">
            {post.body && <PortableText value={post.body} />}
          </div>
        </div>
      </article>
    </>
  )
}

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText } from '@portabletext/react'
import { ArrowLeft, Calendar, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { sanityFetch, blogPostQuery } from '@/lib/sanity'
import { WhatsAppInlineCta } from '@/components/tracking/WhatsAppInlineCta'
import { JsonLd, buildBreadcrumbSchema, buildArticleSchema, buildFaqSchema } from '@/components/seo/JsonLd'
import { formatDate, calculateReadingTime } from '@/lib/utils'

interface BlogPostData {
  title: string
  slug: { current: string }
  body: Array<{ _type: string; children?: Array<{ text?: string }>; [key: string]: unknown }>
  mainImage?: string
  tags?: string[]
  publishDate: string
  metaTitle?: string
  metaDescription?: string
  ogImage?: string
  canonicalUrl?: string
  focusKeyword?: string
  whatsappContext?: string
  disclaimer?: string
  relatedLinks?: { label: string; href: string }[]
  faqs?: { question: string; answer: string }[]
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

    // The Sanity `canonicalUrl` field is a manually-set string that goes stale
    // whenever a post's slug changes (it isn't derived from the live route).
    // Only trust it when it actually points at this post's current URL -
    // otherwise fall back to the live slug so the canonical can never point
    // at an old/renamed URL.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
    const liveUrl = `${siteUrl}/blog/${slug}`
    const canonical = post.canonicalUrl?.endsWith(`/blog/${slug}`) ? post.canonicalUrl : liveUrl

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || `Read "${post.title}" on Bhuwanta Blog`,
      openGraph: {
        title: post.metaTitle || post.title,
        description: post.metaDescription,
        type: 'article',
        ...(post.ogImage ? { images: [{ url: post.ogImage }] } : {}),
      },
      alternates: { canonical },
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
    ?.map((block) =>
      block.children?.map((c) => c.text).join(' ') || ''
    )
    .join(' ') || ''
  calculateReadingTime(bodyText)

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

  const faqSchema = post.faqs?.length ? buildFaqSchema(post.faqs) : null

  return (
    <>
      <JsonLd data={faqSchema ? [breadcrumb, articleSchema, faqSchema] : [breadcrumb, articleSchema]} />

      <article className="pt-28 sm:pt-32 section-padding pb-20 bg-[#f7f8fa]">
        <div className="max-w-4xl mx-auto bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden">
          
          {/* Hero Image */}
          {post.mainImage && (
            <div className="w-full aspect-[16/9] relative bg-[#f3f5f8]">
              <Image
                src={post.mainImage}
                alt={`${post.title} - cover image`}
                fill
                sizes="(max-width: 768px) 100vw, 900px"
                priority
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Header / Meta */}
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#5a6a82] mb-6 font-medium">
                <span className="flex items-center gap-1.5 text-[#c4a55a]"><Calendar className="w-4 h-4" /> <span className="text-[#5a6a82]">{formatDate(post.publishDate)}</span></span>
                <span className="text-[#e8ecf2]">•</span>
                <span className="flex items-center gap-1.5 text-[#c4a55a] font-semibold text-[#5a6a82]">Bhuwanta Team</span>
                {post.tags && post.tags.length > 0 && (
                  <>
                    <span className="text-[#e8ecf2]">•</span>
                    <span className="flex items-center gap-1.5 text-[#c4a55a]"><Tag className="w-4 h-4" /> <span className="text-[#5a6a82]">{post.tags[0]}</span></span>
                  </>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] leading-tight mb-8">
                {post.title}
              </h1>
            </header>

            {/* Body */}
            <div className="text-justify prose prose-lg max-w-none prose-headings:text-[#1e3a5f] prose-headings:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-[#1e3a5f] prose-h4:text-[#c4a55a] prose-p:text-[#5a6a82] prose-a:text-[#1e3a5f] prose-a:font-semibold hover:prose-a:text-[#c4a55a] prose-strong:text-[#0f1d33] prose-strong:font-bold prose-blockquote:bg-[#fef9f0] prose-blockquote:border-l-4 prose-blockquote:border-[#c4a55a] prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-[#5a6a82] prose-blockquote:not-italic prose-li:text-[#5a6a82] prose-ul:text-[#5a6a82] prose-ol:text-[#5a6a82]">
              {post.body && (
                <PortableText 
                  value={post.body} 
                  components={{
                    block: {
                      normal: ({ children }: { children?: React.ReactNode }) => {
                        // If the user hit enter to create an empty line, force it to take up vertical space
                        if (!children || (Array.isArray(children) && (children.length === 0 || (children.length === 1 && children[0] === '')))) {
                          return <p className="h-6"><br /></p>
                        }
                        return <p>{children}</p>
                      },
                      h2: ({ children }: any) => <h2 className="font-bold text-2xl sm:text-3xl text-[#1e3a5f] mt-12 mb-6">{children}</h2>,
                      h3: ({ children }: any) => <h3 className="font-bold text-xl sm:text-2xl text-[#1e3a5f] mt-8 mb-4">{children}</h3>,
                      h4: ({ children }: any) => <h4 className="font-bold text-lg sm:text-xl text-[#c4a55a] mt-6 mb-3">{children}</h4>,
                    },
                    types: {
                      image: ({ value }: any) => {
                        if (!value?.asset?._ref) return null;
                        const src = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${value.asset._ref.replace('image-', '').replace('-jpg', '.jpg').replace('-png', '.png').replace('-webp', '.webp')}`
                        return (
                          <Image
                            src={src}
                            alt={value.alt || 'Blog Image'}
                            width={800}
                            height={400}
                            className="rounded-lg object-cover w-full h-auto mt-8 mb-4 shadow-sm"
                          />
                        )
                      },
                      blogTable: ({ value }: any) => {
                        if (!value || (!value.headers && !value.rows)) return null;
                        return (
                          <div className="my-8 overflow-x-auto rounded-lg border border-[#e8ecf2] shadow-sm">
                            <table className="w-full text-left border-collapse">
                              <thead className="bg-[#1e3a5f] text-white">
                                <tr>
                                  {value.headers?.map((header: string, i: number) => (
                                    <th key={i} className="px-3 py-3 md:px-4 font-bold border-b border-[#1e3a5f] text-sm md:text-base">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="text-[#5a6a82] bg-white">
                                {value.rows?.map((row: any, i: number) => (
                                  <tr key={i} className="border-b border-[#e8ecf2] hover:bg-[#f7f8fa] transition-colors">
                                    {row.cells?.map((cell: string, j: number) => (
                                      <td 
                                        key={j} 
                                        className={`px-3 py-3 md:px-4 text-sm md:text-base align-top ${j === 0 ? 'font-semibold text-[#0f1d33]' : ''}`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )
                      }
                    },
                    marks: {
                      link: ({ children, value }: any) => {
                        const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
                        const target = !value.href.startsWith('/') ? '_blank' : undefined;
                        return (
                          <Link href={value.href} rel={rel} target={target}>
                            {children}
                          </Link>
                        );
                      }
                    }
                  }}
                />
              )}
            </div>

            {post.whatsappContext && (
              <div className="mt-10 flex justify-center">
                <WhatsAppInlineCta context={post.whatsappContext} label="Ask Us on WhatsApp" />
              </div>
            )}

            {/* FAQs */}
            {post.faqs && post.faqs.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[#e8ecf2]">
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {post.faqs.map((faq, i) => (
                    <div key={i}>
                      <h3 className="text-lg font-bold text-[#0f1d33] mb-2">{faq.question}</h3>
                      <p className="text-[#5a6a82] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {post.disclaimer && (
              <p className="mt-10 text-sm text-[#5a6a82] italic border-t border-[#e8ecf2] pt-6">
                {post.disclaimer}
              </p>
            )}

            {post.relatedLinks && post.relatedLinks.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[#e8ecf2] flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#5a6a82]">
                <span>Related:</span>
                {post.relatedLinks.map((link, i) => (
                  <span key={link.href}>
                    <Link href={link.href} className="font-semibold text-[#1e3a5f] hover:text-[#c4a55a]">{link.label}</Link>
                    {i < (post.relatedLinks?.length ?? 0) - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[#e8ecf2] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-sm text-[#5a6a82]">
                Share this article:
                <div className="flex gap-2">
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${siteUrl}/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors text-xs font-bold">f</a>
                  <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`${siteUrl}/blog/${slug}`)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors text-[10px] font-bold">in</a>
                  <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${siteUrl}/blog/${slug}`)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white transition-colors text-xs font-bold">x</a>
                </div>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#c4a55a] hover:text-[#a38743] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to all blogs
              </Link>
            </footer>
          </div>
        </div>
      </article>
    </>
  )
}

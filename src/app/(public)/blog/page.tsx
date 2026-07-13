import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Tag, BookOpen } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, blogListQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'
import { PageBanner } from '../../../components/ui/PageBanner'
import { CtaSection } from '@/components/ui/CtaSection'
import { NewsletterForm } from '@/components/ui/NewsletterForm'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('blog', 'Blog', 'Practical advice on buying land, understanding approvals, Vastu principles, and building wealth through real estate.')
}

export const revalidate = 3600

interface BlogPost {
  title: string
  slug: { current: string }
  excerpt?: string
  mainImage?: string
  tags?: string[]
  publishDate: string
}

// Common shape both CMS blog posts and hand-authored guide pages are mapped
// into, so they render as one indistinguishable blog grid rather than a
// separate "guides" section.
interface BlogCard {
  href: string
  title: string
  excerpt: string
  image: string
  tag: string
  publishDate: string
}

const ogImage = (title: string, subtitle: string) =>
  `https://bhuwanta.com/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(subtitle)}`

const staticGuides: BlogCard[] = [
  {
    href: '/blog/verify-hmda-dtcp-approval-telangana',
    title: 'How to Verify HMDA/DTCP Approval in Telangana: Step-by-Step (2026)',
    excerpt: 'A step-by-step guide to verifying HMDA and DTCP layout approval and RERA registration in Telangana using the official government portals, before you buy a plot.',
    image: ogImage('How to Verify HMDA/DTCP Approval', 'Step-by-Step Guide Using Official Telangana Portals'),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
  {
    href: '/hmda-vs-dtcp-plots-hyderabad',
    title: 'HMDA vs DTCP Approved Plots in Hyderabad: Complete 2026 Comparison',
    excerpt: 'HMDA vs DTCP approved plots in Hyderabad — compare pricing, infrastructure, approval process, and appreciation potential to choose the right plot for your investment goals.',
    image: ogImage('HMDA vs DTCP Approved Plots', 'Complete 2026 Comparison'),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
  {
    href: '/blog/open-plots-shabad-hyderabad-hmda-approved-guide',
    title: 'Open Plots in Shabad, Hyderabad: HMDA Approved Plots Near Bangalore Highway (2026 Guide)',
    excerpt: 'A complete 2026 guide to open plots in Shabad, Hyderabad — HMDA approval, what drives value on the NH-44 Bangalore Highway corridor, and how to verify a plot before you buy.',
    image: ogImage('Open Plots in Shabad, Hyderabad', 'HMDA Approved Plots Near Bangalore Highway — 2026 Guide'),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
  {
    href: '/blog/dtcp-vs-hmda-plots-shadnagar-buyer-guide',
    title: "DTCP vs HMDA Approved Plots in Shadnagar: Complete Buyer's Guide (2026)",
    excerpt: "DTCP vs HMDA approved plots in the Shadnagar area — what applies where, how to verify either approval type, and where Bhuwanta's nearest verified project fits in.",
    image: ogImage('DTCP vs HMDA Plots in Shadnagar', "Complete Buyer's Guide (2026)"),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
  {
    href: '/blog/shabad-vs-shadnagar-investment-comparison',
    title: 'Shabad vs Shadnagar: Which Growth Corridor Should You Invest In?',
    excerpt: "Shabad vs Shadnagar — a straight comparison of Hyderabad's NH-44 growth corridor towns, who should choose which, and where verified, HMDA-approved inventory is available today.",
    image: ogImage('Shabad vs Shadnagar', 'Which Growth Corridor Should You Invest In?'),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
  {
    href: '/blog/open-plots-shadnagar-growth-story-2026',
    title: "Open Plots for Sale in Shadnagar: What's Driving the 2026 Growth Story",
    excerpt: "Why Shadnagar is drawing buyer interest in 2026 — micro-location context, infrastructure drivers, and the red flags to check before buying any open plot in this corridor.",
    image: ogImage('Open Plots for Sale in Shadnagar', "What's Driving the 2026 Growth Story"),
    tag: 'Blog',
    publishDate: '2026-07-13',
  },
]

export default async function BlogPage() {
  let posts: BlogPost[] = []

  try {
    const data = await sanityFetch<BlogPost[]>({ query: blogListQuery, tags: ['blog'] })
    if (data) posts = data
  } catch { /* fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
  ])

  const postCards: BlogCard[] = posts
    .filter((post) => post.slug?.current)
    .map((post) => ({
      href: `/blog/${post.slug.current}`,
      title: post.title,
      excerpt: post.excerpt || 'Read this article to learn more about our latest real estate updates and insights.',
      image: post.mainImage || ogImage(post.title, 'Bhuwanta Developers'),
      tag: post.tags?.[0] || 'Blog',
      publishDate: post.publishDate,
    }))

  const allCards = [...postCards, ...staticGuides]

  return (
    <>
      <JsonLd data={breadcrumb} />

      <PageBanner
        title={<>Latest <span className="text-[#c4a55a]">Blogs</span></>}
      />

      {/* Blog Grid Section */}
      <section className="py-20 bg-[#f7f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {allCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allCards.map((card) => (
                <Link key={card.href} href={card.href} className="block h-full group">
                  <article className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                    <div className="w-full aspect-[16/9] relative overflow-hidden bg-[#f7f8fa]">
                      <Image
                        src={card.image}
                        alt={`${card.title} — cover image`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-sm text-[#5a6a82] mb-4 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#c4a55a]" /> {formatDate(card.publishDate)}</span>
                        <span className="text-[#e8ecf2]">•</span>
                        <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-[#c4a55a]" /> {card.tag}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#1e3a5f] mb-3 group-hover:text-[#c4a55a] transition-colors line-clamp-2 leading-snug">
                        {card.title}
                      </h3>
                      <p className="text-[#5a6a82] text-base mb-6 line-clamp-3 flex-grow">
                        {card.excerpt}
                      </p>
                      <div className="inline-flex items-center gap-2 text-base font-bold text-[#c4a55a] group-hover:text-[#a38743] transition-colors mt-auto">
                        Read More <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-[#c4a55a] mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-[#0f1d33] mb-2">No blogs found</h3>
              <p className="text-[#5a6a82]">Check back later for new insights and updates.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white border-t border-[#e8ecf2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <NewsletterForm />
        </div>
      </section>

      <CtaSection />
    </>
  )
}

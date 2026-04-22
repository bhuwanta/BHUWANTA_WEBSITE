import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Tag, Bell } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, blogListQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'
import { BlogSubscribeForm } from './BlogSubscribeForm'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('blog', 'Blog', 'Practical advice on buying land, understanding approvals, Vastu principles, and building wealth through real estate.')
}

export const revalidate = 3600

interface BlogPost {
  title: string
  slug: { current: string }
  excerpt?: string
  tags?: string[]
  publishDate: string
}

const plannedTopics = [
  'Why HMDA approval matters — and how to verify it yourself',
  'Is buying land in Hyderabad still a good investment in 2026?',
  'Vastu for plots: what to look for before you buy',
  'The 7 documents every plot buyer must ask for',
  'Plot loan vs home loan — what\'s the difference?',
  'How to evaluate a real estate developer before trusting them',
  'NRI guide to buying land in Hyderabad',
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

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb] luxury-bg-grid">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase luxury-subheading">Insights & Advice</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935] luxury-heading">
            Insights on Land, Investment &{' '}
            <span className="text-gradient">Living Well</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            Practical advice on buying land, understanding approvals, Vastu principles, and building wealth through real estate.
          </p>
        </div>
      </section>

      {/* Blog Content */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <>
              {/* Coming Soon Banner */}
              <div className="max-w-2xl mx-auto text-center mb-16 relative z-10">
                <div className="bg-[#f8f9fb] rounded-2xl p-8 sm:p-12 border border-[#e8ecf2] luxury-bg-topography">
                  <div className="w-14 h-14 rounded-2xl bg-[#BA9832]/10 flex items-center justify-center mx-auto mb-6 relative z-10">
                    <Bell className="w-7 h-7 text-[#BA9832]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#002935] mb-3 luxury-heading relative z-10">Our Blog is Coming Soon</h2>
                  <p className="text-[#5a6a82] mb-6 relative z-10">
                    Subscribe below to be notified when we publish our first articles.
                  </p>
                  <BlogSubscribeForm />
                </div>
              </div>

              {/* Planned Topics */}
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-bold text-[#002935] mb-6 text-center">Upcoming Topics</h3>
                <div className="space-y-3">
                  {plannedTopics.map((topic, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#e8ecf2] hover:border-[#BA9832]/20 transition-premium">
                      <span className="text-xs font-bold text-[#BA9832] bg-[#BA9832]/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[#002935] font-medium">{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link
                  key={post.slug.current}
                  href={`/blog/${post.slug.current}`}
                  className="bg-white rounded-2xl overflow-hidden group transition-premium border border-[#e8ecf2] hover:border-[#BA9832]/30 hover:shadow-xl hover:scale-[1.02]"
                >
                  <div className="aspect-[16/9] bg-gradient-to-br from-[#002935] to-[#003d4f] relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white/10">{post.title.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-[#5a6a82] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.publishDate)}
                      </span>
                      {post.tags?.[0] && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5" />
                          {post.tags[0]}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-semibold text-[#002935] mb-2 group-hover:text-[#003d4f] transition-premium">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-[#5a6a82] line-clamp-2 mb-4">{post.excerpt}</p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#BA9832]">
                      Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

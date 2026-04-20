import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Tag } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, blogListQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('blog', 'Blog', 'Insights, trends, and expert advice on real estate, architecture, and luxury living.')
}

export const revalidate = 3600

interface BlogPost {
  title: string
  slug: { current: string }
  excerpt?: string
  tags?: string[]
  publishDate: string
}

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
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Insights & News</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            Our <span className="text-gradient">Blog</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            Expert insights on real estate trends, architecture, and luxury living.
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl p-12 max-w-md mx-auto border border-[#e8ecf2] shadow-sm">
                <p className="text-[#5a6a82] mb-2">No blog posts yet.</p>
                <p className="text-sm text-[#5a6a82]/60">Create posts in Sanity Studio at /studio.</p>
              </div>
            </div>
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

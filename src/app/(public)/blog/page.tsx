import { Metadata } from 'next'
import Link from 'next/link'
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

      <PageBanner 
        title={<>Latest <span className="text-[#c4a55a]">Blogs</span></>} 
      />

      {/* Blog Grid Section */}
      <section className="py-20 bg-[#f7f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Link key={post.slug.current} href={`/blog/${post.slug.current}`} className="block h-full group">
                  <article className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                    {post.mainImage && (
                      <div className="w-full aspect-[16/9] relative overflow-hidden bg-[#f7f8fa]">
                        <img src={post.mainImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 text-sm text-[#5a6a82] mb-4 font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-[#c4a55a]" /> {formatDate(post.publishDate)}</span>
                        <span className="text-[#e8ecf2]">•</span>
                        {post.tags && post.tags.length > 0 && (
                          <span className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-[#c4a55a]" /> {post.tags[0]}</span>
                        )}
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-[#1e3a5f] mb-3 group-hover:text-[#c4a55a] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[#5a6a82] text-base mb-6 line-clamp-3 flex-grow">
                        {post.excerpt || 'Read this article to learn more about our latest real estate updates and insights.'}
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

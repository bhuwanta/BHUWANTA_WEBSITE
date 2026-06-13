import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Calendar, Tag, BookOpen } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, blogListQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { formatDate } from '@/lib/utils'
import { PageBanner } from '../../../components/ui/PageBanner'
import { CtaSection } from '@/components/ui/CtaSection'

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
        title="Latest Blogs" 
      />

      {/* Newsletter Section */}
      <section className="py-20 bg-white border-t border-[#e8ecf2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33] mb-4">Subscribe to Our Newsletter</h2>
            <p className="text-[#5a6a82] text-sm sm:text-base mb-8 max-w-2xl mx-auto">
              Get the latest real estate updates, investment tips, and project launches directly in your inbox.
            </p>
            
            <form className="flex flex-col sm:flex-row max-w-lg mx-auto gap-3">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                required
                className="flex-1 bg-[#f3f5f8] border border-[#e8ecf2] rounded-lg px-4 py-3 text-[#0f1d33] text-sm focus:outline-none focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] transition-colors placeholder-[#5a6a82]"
              />
              <button 
                type="submit" 
                className="gradient-gold text-white font-semibold rounded-lg px-6 py-3 shadow-lg shadow-[#c4a55a]/20 hover:scale-105 transition-premium text-sm whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}

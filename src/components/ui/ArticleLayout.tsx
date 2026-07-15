import Link from 'next/link'
import { Calendar, Tag } from 'lucide-react'
import { JsonLd, buildBreadcrumbSchema, buildArticleSchema, buildFaqSchema } from '@/components/seo/JsonLd'
import { CtaSection } from '@/components/ui/CtaSection'
import { WhatsAppInlineCta } from '@/components/ui/WhatsAppInlineCta'

export interface ArticleFaq {
  question: string
  answer: string
}

export function ArticleLayout({
  slug,
  title,
  description,
  tag,
  publishDate,
  children,
  faqs,
  relatedLinks,
  whatsappContext,
  disclaimer,
}: {
  slug: string
  title: string
  description: string
  tag: string
  publishDate: string
  children: React.ReactNode
  faqs: ArticleFaq[]
  relatedLinks: { href: string; label: string }[]
  whatsappContext: string
  disclaimer?: string
}) {
  const siteUrl = 'https://bhuwanta.com'
  const pageUrl = `${siteUrl}/blog/${slug}`

  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Blog', url: `${siteUrl}/blog` },
    { name: title, url: pageUrl },
  ])
  const articleSchema = buildArticleSchema({
    title,
    description,
    url: pageUrl,
    datePublished: publishDate,
    authorName: 'Bhuwanta Team',
    publisherName: 'Bhuwanta',
  })
  const faqSchema = faqs.length > 0 ? buildFaqSchema(faqs) : null

  return (
    <>
      <JsonLd data={faqSchema ? [breadcrumb, articleSchema, faqSchema] : [breadcrumb, articleSchema]} />

      <article className="pt-28 sm:pt-32 section-padding pb-20 bg-[#f7f8fa]">
        <div className="max-w-4xl mx-auto bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <header className="mb-10">
              <div className="flex flex-wrap items-center gap-3 text-sm text-[#5a6a82] mb-6 font-medium">
                <span className="flex items-center gap-1.5 text-[#c4a55a]">
                  <Calendar className="w-4 h-4" /> <span className="text-[#5a6a82]">{publishDate}</span>
                </span>
                <span className="text-[#e8ecf2]">•</span>
                <span className="text-[#5a6a82] font-semibold">Bhuwanta Team</span>
                <span className="text-[#e8ecf2]">•</span>
                <span className="flex items-center gap-1.5 text-[#c4a55a]">
                  <Tag className="w-4 h-4" /> <span className="text-[#5a6a82]">{tag}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1e3a5f] leading-tight">{title}</h1>
            </header>

            <div className="prose prose-lg max-w-none prose-headings:text-[#1e3a5f] prose-h2:text-2xl prose-h3:text-xl prose-p:text-[#5a6a82] prose-a:text-[#1e3a5f] prose-a:font-semibold hover:prose-a:text-[#c4a55a] prose-strong:text-[#0f1d33] prose-li:text-[#5a6a82] prose-ul:text-[#5a6a82] prose-ol:text-[#5a6a82]">
              {children}
            </div>

            <div className="mt-10 flex justify-center">
              <WhatsAppInlineCta context={whatsappContext} label="Ask Us on WhatsApp" />
            </div>

            {faqs.length > 0 && (
              <div className="mt-16 pt-8 border-t border-[#e8ecf2]">
                <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {faqs.map((faq, i) => (
                    <div key={i}>
                      <h3 className="text-lg font-bold text-[#0f1d33] mb-2">{faq.question}</h3>
                      <p className="text-[#5a6a82] leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {disclaimer && (
              <p className="mt-10 text-sm text-[#5a6a82] italic border-t border-[#e8ecf2] pt-6">
                {disclaimer}
              </p>
            )}

            {relatedLinks.length > 0 && (
              <footer className="mt-16 pt-8 border-t border-[#e8ecf2] flex flex-wrap gap-x-2 gap-y-1 text-sm text-[#5a6a82]">
                <span>Related:</span>
                {relatedLinks.map((link, i) => (
                  <span key={link.href}>
                    <Link href={link.href} className="font-semibold text-[#1e3a5f] hover:text-[#c4a55a]">{link.label}</Link>
                    {i < relatedLinks.length - 1 ? ',' : ''}
                  </span>
                ))}
              </footer>
            )}
          </div>
        </div>
      </article>

      <CtaSection />
    </>
  )
}

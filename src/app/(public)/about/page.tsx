import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import AboutClientPage from './AboutClientPage'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('about', 'About Us', 'Learn about BHUWANTA — a Hyderabad-based land development company built on transparency, legal clarity, and HMDA & DTCP approved open plot ventures.')
}

export default async function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />
      <AboutClientPage />
    </>
  )
}

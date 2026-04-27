import { Metadata } from 'next'
import { Eye, Target, ShieldCheck, Scale, FileCheck, CheckCircle } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, aboutQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import Link from 'next/link'

import { PageBanner } from '../../../components/ui/PageBanner'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('about', 'About Us', 'Learn about Bhuwanta — a Hyderabad-based land development company built on transparency, legal clarity, and Vastu-aligned plot communities.')
}

export const revalidate = 300

const fallback = {
  whoWeAreHeading: 'We Are Bhuwanta',
  whoWeAreBody: `Bhuwanta is a Hyderabad-based land development company built on a single, non-negotiable principle: every buyer deserves complete transparency, legal clarity, and a plot they can be proud to own.\n\nFounded by professionals with deep roots in Hyderabad's real estate sector, Bhuwanta was born out of a simple frustration — too many buyers were misled, confused, or left without proper documentation after land purchases. We exist to change that.\n\nWe develop HMDA-approved, Vastu-aligned plot communities across Hyderabad's high-growth corridors — giving families the foundation to build their dream homes, and investors the security of a trusted, appreciating asset.`,
  visionHeading: 'Our Vision',
  visionBody: 'To make land ownership in Hyderabad simple, trustworthy, and genuinely life-changing — for first-time buyers, seasoned investors, and NRI families finding their way home.',
  missionHeading: 'Our Mission',
  missionBody: 'At Bhuwanta, everything we do is guided by three commitments:',
  missionCommitments: [
    { title: 'Legal First, Always', description: 'We only develop plots with complete HMDA approval, clear title, and full documentation — before a single plot is offered for sale.' },
    { title: 'Vastu by Design', description: 'Every master layout is planned in consultation with certified Vastu experts, so the land you buy is aligned for harmony, health, and prosperity.' },
    { title: 'Total Transparency', description: 'No hidden charges. No jargon. No pressure. You will know every cost, every document, and every detail — before you sign anything.' },
  ],
  whyChooseHeading: 'What Makes Us Different',
  differentiators: [
    { title: 'Legal Clarity from Day One', description: 'Every project carries full HMDA approval and clear title documentation. You will never wonder about the legal status of your investment.' },
    { title: 'Vastu-Certified Master Layouts', description: "Our layouts aren't an afterthought — they're designed alongside Vastu experts from the ground up." },
    { title: 'Zero Hidden Charges', description: 'Our pricing is flat and disclosed upfront. What we quote is what you pay — nothing added at the last minute.' },
    { title: 'Real People, Real Support', description: "From your first site visit to the day of registration, our team is with you every step of the way. We don't disappear after the sale." },
  ],
  legalHeading: 'Our Legal Commitments',
  legalBody: 'We believe trust is built on paper, not just promises. Before any project goes live, Bhuwanta ensures:',
  legalCommitments: [
    'Full HMDA Layout Approval in place',
    'Encumbrance-free, clear title on all land',
    'RERA registration completed and published',
    'All link documents available for buyer review',
    'Independent legal verification completed',
  ],
  closingLine: 'Bhuwanta. Built on trust. Built on land.',
  closingContact: '📞 [PHONE NUMBER]  |  ✉️ info@bhuwanta.com',
}

export default async function AboutPage() {
  let data = fallback
  try {
    const sanityData = await sanityFetch<typeof fallback>({ query: aboutQuery, tags: ['about'] })
    if (sanityData) data = { ...fallback, ...sanityData }
  } catch { /* Use fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'About', url: `${siteUrl}/about` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />

      <PageBanner 
        title="Discover Bhuwanta" 
      />
    </>
  )
}

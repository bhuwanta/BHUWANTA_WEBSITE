import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, careersQuery, jobListingsQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { PageBanner } from '../../../components/ui/PageBanner'
import { Mail } from 'lucide-react'
import { JobCard } from '@/components/careers/JobCard'

interface JobListing {
  _id: string
  title: string
  department: string
  location: string
  employmentType: string
  description: string
  requirements: string[]
  applyUrl: string
  postedAt: string
}

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('careers', 'Careers', 'Join the Bhuwanta team. We\'re building something from the ground up — if you\'re driven, honest, and excited about real estate done right, we\'d love to hear from you.')
}

export const revalidate = 300

const fallback = {
  pageHeading: 'Join the Bhuwanta Team',
  pageSubheading: "We're building something from the ground up — quite literally. If you're driven, honest, and excited about real estate done right, we'd love to hear from you.",
  bodyText: "Bhuwanta is a growing company and we're always open to connecting with talented people. Whether you're an experienced real estate professional or someone ready to learn, reach out.",
  whatWeLookFor: [
    'Integrity above everything',
    'A customer-first mindset',
    'Willingness to learn and grow',
    "Passion for Hyderabad's real estate market",
  ],
  applyEmail: 'info@bhuwanta.com',
  footerNote: 'We will get back to every applicant personally. No automated rejections.',
}

export default async function CareersPage() {
  let data = fallback
  let jobs: JobListing[] = []
  
  try {
    const [sanityData, jobsData] = await Promise.all([
      sanityFetch<typeof fallback>({ query: careersQuery, tags: ['careers'] }),
      sanityFetch<JobListing[]>({ query: jobListingsQuery, tags: ['jobListing'] })
    ])
    if (sanityData) data = { ...fallback, ...sanityData }
    if (jobsData) jobs = jobsData
  } catch { /* fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Careers', url: `${siteUrl}/careers` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />

      <PageBanner 
        title="Join Our Team" 
      />

      <section className="py-20 section-padding bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002935] mb-6">{data.pageHeading}</h2>
            <p className="text-[#5a6a82] text-lg leading-relaxed max-w-3xl">
              {data.pageSubheading}
            </p>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#e8ecf2]">
                <h2 className="text-2xl font-bold text-[#002935]">Open Opportunities</h2>
                <span className="px-3 py-1 bg-[#B69A4E]/10 text-[#B69A4E] text-xs font-bold rounded-full uppercase tracking-wider">
                  {jobs?.length || 0} Positions
                </span>
              </div>

              {jobs && jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobs.map((job) => (
                    <JobCard key={job._id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="bg-[#f3f5f8] border border-dashed border-[#e8ecf2] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Mail className="w-8 h-8 text-[#B69A4E]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#002935] mb-2">No active openings right now</h3>
                  <p className="text-[#5a6a82] text-sm max-w-xs mx-auto">
                    But we're always looking for talent. Send your profile to <span className="text-[#B69A4E] font-bold">{data.applyEmail}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

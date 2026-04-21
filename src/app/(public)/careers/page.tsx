import { Metadata } from 'next'
import { MapPin, Briefcase, DollarSign, ExternalLink } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, careersQuery, jobListingsQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema, buildJobPostingSchema } from '@/components/seo/JsonLd'
import { PortableText } from '@portabletext/react'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('careers', 'Careers', 'Join the Bhuwanta team. Explore open positions in real estate development, sales, architecture, and more.')
}

export const revalidate = 300

interface JobListing {
  _id: string
  title: string
  department: string
  location: string
  employmentType: string
  salaryMin: number | null
  salaryMax: number | null
  description: string
  requirements: string[]
  applyUrl: string | null
  postedAt: string
}

export default async function CareersPage() {
  let careersText = {
    introText: 'Join our team of passionate professionals and help us build the future of real estate. We offer competitive compensation, growth opportunities, and a culture that values innovation.',
    cultureCopy: null as any,
    benefitsCopy: null as any,
    whyWorkCopy: null as any,
  }
  let jobs: JobListing[] = []

  try {
    const sanityData = await sanityFetch<typeof careersText>({ query: careersQuery, tags: ['careers'] })
    if (sanityData) careersText = { ...careersText, ...sanityData }
  } catch { /* fallback */ }

  try {
    const jobData = await sanityFetch<JobListing[]>({ query: jobListingsQuery, tags: ['jobListing'] })
    if (jobData) jobs = jobData
  } catch { /* fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Careers', url: `${siteUrl}/careers` },
  ])

  const jobSchemas = jobs.map((job) =>
    buildJobPostingSchema({
      title: job.title,
      description: job.description,
      datePosted: job.postedAt,
      employmentType: job.employmentType,
      location: job.location,
      salaryMin: job.salaryMin || undefined,
      salaryMax: job.salaryMax || undefined,
      companyName: 'Bhuwanta',
      applyUrl: job.applyUrl || undefined,
    })
  )

  return (
    <>
      <JsonLd data={[breadcrumb, ...jobSchemas]} />

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Join Our Team</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            Build Your <span className="text-gradient">Career</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            {careersText.introText}
          </p>
        </div>
      </section>

      {/* Culture / Benefits sections */}
      {(careersText.cultureCopy || careersText.benefitsCopy) && (
        <section className="section-padding pt-0 bg-white">
          <div className="max-w-4xl mx-auto space-y-12">
            {careersText.cultureCopy && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-[#002935] mb-4">Our Culture</h2>
                <PortableText value={careersText.cultureCopy} />
              </div>
            )}
            {careersText.benefitsCopy && (
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold text-[#002935] mb-4">Benefits & Perks</h2>
                <PortableText value={careersText.benefitsCopy} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Job Listings */}
      <section className="section-padding pt-0 bg-white" id="openings">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#002935] mb-8">Open Positions</h2>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#e8ecf2]">
              <p className="text-[#5a6a82] mb-2">No open positions at the moment.</p>
              <p className="text-sm text-[#5a6a82]/60">Check back soon or send us your resume via the contact page.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="glass-card rounded-xl p-6 transition-premium hover:border-[#BA9832]/30 hover:shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#002935] mb-2">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5a6a82] mb-3">
                        {job.department && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-[#BA9832]" />
                            {job.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#BA9832]" />
                          {job.location}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-[#003d4f]/10 text-[#003d4f] border border-[#003d4f]/20 font-medium">
                          {job.employmentType.replace('-', ' ')}
                        </span>
                        {job.salaryMin && job.salaryMax && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5 text-[#BA9832]" />
                            ₹{(job.salaryMin / 100000).toFixed(0)}L - ₹{(job.salaryMax / 100000).toFixed(0)}L
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#5a6a82] line-clamp-2">{job.description}</p>
                    </div>
                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg gradient-gold text-white transition-premium hover:scale-105 shrink-0"
                      >
                        Apply <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

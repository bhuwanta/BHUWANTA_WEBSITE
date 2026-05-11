import { notFound } from 'next/navigation'
import Image from 'next/image'
import { FileDown, Video, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { sanityFetch, projectsQuery, urlFor } from '@/lib/sanity'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { Metadata } from 'next'
import { ShareButton } from './ShareButton'
import { WatchVideoButton } from './WatchVideoButton'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await sanityFetch<{ projectEntries?: any[] }>({ query: projectsQuery, tags: ['projects'] })
  const project = data?.projectEntries?.find((p) => p.slug?.current === slug)
  if (!project) return { title: 'Project Not Found' }
  return { title: `${project.name} | Bhuwanta`, description: project.description }
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await sanityFetch<{ projectEntries?: any[] }>({ query: projectsQuery, tags: ['projects'] })
  const project = data?.projectEntries?.find((p) => p.slug?.current === slug)

  if (!project) notFound()

  const brochureUrl = project.brochureFile?.asset?.url
  const videoUrl = project.videoFile?.asset?.url

  return (
    <div className="pt-32 pb-24 min-h-screen bg-[#f7f8fa]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm font-semibold text-[#5a6a82] hover:text-[#0f1d33] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-[#e8ecf2]">
          {/* Project Header Image */}
          <div className="aspect-[21/9] bg-[#e8ecf2] relative">
            {project.image?.asset ? (
              <Image
                src={urlFor(project.image).url()}
                alt={project.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-[#0f1d33]/5" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="inline-block px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full mb-4">
                {project.statusText === 'registrations-open' ? 'Registrations Open' : 'HMDA Approved'}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{project.name}</h1>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="w-5 h-5" /> {project.location || 'Hyderabad'}
              </div>
            </div>
          </div>

          {/* Project Content */}
          <div className="p-8 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h2 className="text-2xl font-bold text-[#0f1d33] mb-4">About the Project</h2>
                  <p className="text-lg text-[#5a6a82] leading-relaxed">
                    {project.description}
                  </p>
                </section>

                {(project.amenities?.length > 0 || project.locationHighlights?.length > 0) && (
                  <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-[#e8ecf2]">
                    {project.amenities?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-[#0f1d33] mb-4">Amenities</h3>
                        <ul className="space-y-3">
                          {project.amenities.map((item: any, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-[#5a6a82]">
                              <DynamicIcon name={item.icon} className="w-5 h-5 text-[#c4a55a]" /> {item.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {project.locationHighlights?.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-[#0f1d33] mb-4">Location Highlights</h3>
                        <ul className="space-y-3">
                          {project.locationHighlights.map((item: any, i: number) => (
                            <li key={i} className="flex items-center gap-3 text-[#5a6a82]">
                              <DynamicIcon name={item.icon} className="w-5 h-5 text-[#1e3a5f]" /> {item.label}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </section>
                )}
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-[#f8f9fb] border border-[#e8ecf2]">
                  <h3 className="text-xl font-bold text-[#0f1d33] mb-6">Quick Actions</h3>
                  <div className="space-y-3">
                    {brochureUrl && (
                      <a
                        href={`${brochureUrl}?dl=`}
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold rounded-lg gradient-gold text-white transition-premium hover:scale-[1.02] shadow-sm"
                      >
                        <FileDown className="w-4 h-4" /> Download Brochure
                      </a>
                    )}
                    {videoUrl && (
                      <WatchVideoButton videoUrl={videoUrl} />
                    )}
                    <ShareButton title={project.name} text={project.description} />
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-[#e8ecf2] shadow-sm">
                  <h3 className="text-xl font-bold text-[#0f1d33] mb-4">Project Details</h3>
                  <ul className="space-y-4">
                    {project.plotSizes && (
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-[#5a6a82]">Plot Sizes</span>
                        <span className="font-semibold text-[#0f1d33]">{project.plotSizes}</span>
                      </li>
                    )}
                    {project.pricePerSqYd && (
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-[#5a6a82]">Price/sq.yd</span>
                        <span className="font-semibold text-[#0f1d33]">{project.pricePerSqYd}</span>
                      </li>
                    )}
                    {project.hmdaLpNumber && (
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-[#5a6a82]">HMDA No.</span>
                        <span className="font-semibold text-[#0f1d33]">{project.hmdaLpNumber}</span>
                      </li>
                    )}
                    {project.reraNumber && (
                      <li className="flex justify-between items-center text-sm">
                        <span className="text-[#5a6a82]">RERA No.</span>
                        <span className="font-semibold text-[#0f1d33]">{project.reraNumber}</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Master Layout */}
            {project.masterLayoutImage?.asset && (
              <div className="mt-12 pt-12 border-t border-[#e8ecf2]">
                <h3 className="text-2xl font-bold text-[#0f1d33] mb-6">Master Layout</h3>
                <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-[#e8ecf2]">
                  <Image
                    src={urlFor(project.masterLayoutImage).url()}
                    alt={`${project.name} Master Layout`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}

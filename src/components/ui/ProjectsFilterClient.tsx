'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { MapPin, Crown, Check, CreditCard, Download } from 'lucide-react'
import { ProjectImageCarousel } from '@/components/ui/ProjectImageCarousel'

export interface ProjectEntry {
  name: string
  category?: string
  categoryTitle?: string
  slug?: { current: string }
  location: string
  googleMapsUrl?: string
  description: string
  plotSizes: string
  images?: string[]
  projectHighlights?: string[]
  brochureUrl?: string
  approvalBadge?: string
  videoUrl?: string
  youtubeUrl?: string
}

export function ProjectsFilterClient({ projects, categories = [] }: { projects: ProjectEntry[], categories?: { id: string; title: string; label: string; order?: number }[] }) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const filterRef = useRef<HTMLDivElement>(null)

  const handleFilterClick = (catId: string) => {
    setActiveFilter(catId)
    setTimeout(() => {
      if (filterRef.current) {
        // Adjust scroll offset to account for navbar height
        const y = filterRef.current.getBoundingClientRect().top + window.scrollY - 100
        window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }, 10)
  }

  const sortedCategories = [...categories].sort((a, b) => {
    const aHasProjects = projects.some(p => p.category === a.id)
    const bHasProjects = projects.some(p => p.category === b.id)
    
    if (aHasProjects && !bHasProjects) return -1
    if (!aHasProjects && bHasProjects) return 1
    
    return (a.order || 99) - (b.order || 99)
  })

  const filterCategories = [
    { id: 'all', title: 'All Projects', label: 'All' },
    ...sortedCategories
  ]

  const activeCategories = activeFilter === 'all' 
    ? filterCategories.filter(c => c.id !== 'all') 
    : filterCategories.filter(c => c.id === activeFilter)

  return (
    <div ref={filterRef}>
      <div className="bg-white border-b border-[#e8ecf2] py-4 shadow-sm sticky top-[80px] sm:top-[96px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {filterCategories.slice(0, 6).map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => handleFilterClick(cat.id)}
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    activeFilter === cat.id ? 'text-[#c4a55a] font-bold border-b-2 border-[#c4a55a] pb-1' : 'text-[#1e3a5f] hover:text-[#c4a55a] pb-1 border-b-2 border-transparent'
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${activeFilter === cat.id ? 'text-[#c4a55a]' : 'text-[#c4a55a]'}`} />
                  <span className="capitalize">{cat.label}</span>
                </button>
              ))}
            </div>

            {filterCategories.length > 6 && (
              <div className="hidden lg:block w-px h-6 bg-[#e8ecf2]"></div>
            )}

            {filterCategories.length > 6 && (
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                {filterCategories.slice(6).map((cat) => (
                  <button 
                    key={cat.id} 
                    onClick={() => handleFilterClick(cat.id)}
                    className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${
                      activeFilter === cat.id ? 'text-[#c4a55a] border-b-2 border-[#c4a55a] pb-1' : 'text-[#0f1d33] hover:text-[#c4a55a] pb-1 border-b-2 border-transparent'
                    }`}
                  >
                    <MapPin className={`w-4 h-4 ${activeFilter === cat.id ? 'text-[#c4a55a]' : 'text-[#c4a55a]'}`} />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-16 bg-[#f7f8fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {activeCategories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-36">
              <div className="flex items-center justify-center gap-3 mb-8 text-center">
                <div className="w-10 h-10 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-[#1e3a5f]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33]">{category.title}</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-8">
                {projects.filter(p => p.category === category.id).length > 0 ? (
                  projects.filter(p => p.category === category.id).map((project, idx) => (
                    <div key={idx} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden flex flex-col lg:flex-row transition-premium hover:shadow-md group">
                      
                      {/* Left: Image Area */}
                      <div className="w-full lg:w-2/5 h-64 lg:h-auto bg-[#f3f5f8] relative overflow-hidden flex-shrink-0 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[#e8ecf2]">
                        <ProjectImageCarousel images={project.images} projectName={project.name} videoUrl={project.videoUrl} youtubeUrl={project.youtubeUrl} />
                        <div className="absolute inset-0 bg-[#1e3a5f]/5 group-hover:bg-transparent transition-colors z-30 pointer-events-none"></div>
                      </div>

                      {/* Right: Content */}
                      <div className="p-6 md:p-8 flex flex-col w-full">
                         <div className="flex flex-wrap gap-2 mb-3">
                           <span className="px-3 py-1 bg-[#c4a55a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">Open Plots</span>
                           {project.approvalBadge && (
                             <span className="px-3 py-1 bg-[#c4a55a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">{project.approvalBadge}</span>
                           )}
                         </div>

                         <h3 className="text-xl font-extrabold text-[#1e3a5f] mb-1 flex items-center gap-2"><Crown className="w-5 h-5 text-[#c4a55a] shrink-0" /> {project.name}</h3>
                         <p className="text-sm font-semibold text-[#c4a55a] mb-6">
                           {project.location || 'Location Details Available Soon'}
                         </p>

                         {project.projectHighlights && project.projectHighlights.length > 0 && (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 mb-8 text-sm font-medium text-[#0f1d33]">
                             {project.projectHighlights.map((highlight, i) => (
                               <div key={i} className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full bg-[#c4a55a] flex items-center justify-center shrink-0">
                                   <Check className="w-3 h-3 text-white stroke-[3]" />
                                 </div>
                                 {highlight}
                               </div>
                             ))}
                           </div>
                         )}

                         <div className="mt-auto">
                           <div className="flex flex-wrap items-center gap-3 mb-4">
                             <Link href="/#book-visit" className="px-6 py-2 gradient-gold text-white font-semibold rounded shadow-lg shadow-[#c4a55a]/20 hover:scale-105 transition-premium text-sm text-center">
                               Enquire Now
                             </Link>
                             {project.slug?.current && (
                               <Link href={`/projects/${project.slug.current}`} className="px-6 py-2 bg-white border border-[#c4a55a] text-[#c4a55a] font-semibold rounded hover:bg-[#f7f8fa] transition-premium text-sm text-center">
                                 View Project
                               </Link>
                             )}
                             {project.googleMapsUrl && (
                               <a href={project.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-white border border-[#e8ecf2] text-[#0f1d33] font-semibold rounded hover:bg-[#f3f5f8] transition-premium text-sm text-center flex items-center gap-2">
                                 <MapPin className="w-4 h-4 text-[#c4a55a]" /> Location
                               </a>
                             )}
                             {project.brochureUrl && (
                               <a href={project.brochureUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-2 bg-white border border-[#e8ecf2] text-[#0f1d33] font-semibold rounded hover:bg-[#f3f5f8] transition-premium text-sm text-center flex items-center gap-2">
                                 <Download className="w-4 h-4 text-[#c4a55a]" /> Brochure
                               </a>
                             )}
                           </div>
                           <div className="mt-4 pt-4 border-t border-[#e8ecf2] flex items-center gap-2 text-xs font-semibold text-[#5a6a82]">
                             <CreditCard className="w-4 h-4 text-[#5a6a82]" />
                             Bank Loan Available <span className="text-[#e8ecf2]">|</span> Ready for Construction
                           </div>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl p-12 text-center">
                    <div className="w-16 h-16 bg-[#f3f5f8] rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-8 h-8 text-[#1e3a5f]/40" />
                    </div>
                    <h3 className="text-xl font-bold text-[#0f1d33] mb-2">New Projects Coming Soon</h3>
                    <p className="text-[#5a6a82]">We are actively acquiring premium lands in {category.title.replace(' Projects', '')}. Stay tuned!</p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

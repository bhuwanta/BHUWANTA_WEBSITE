'use client'

import { useState } from 'react'
import { Play, Image as ImageIcon, Film, X, Share2, Camera, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import Script from 'next/script'

interface ProjectGallery {
  name: string
  categoryTitle: string | null
  images: string[]
  videoUrls: string[]
  youtubeIds: string[]
}

interface GalleryData {
  pageHeading?: string
  generalImages?: string[]
  generalVideos?: string[]
  generalYoutubeUrls?: string[]
}

interface GalleryGridProps {
  projects: ProjectGallery[]
  gallerySingleton?: GalleryData | null
}

export function GalleryGrid({ projects = [], gallerySingleton = null }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'social_media' | 'photos' | 'videos'>('photos')
  const [lightboxImage, setLightboxImage] = useState<{ url: string; alt: string } | null>(null)

  // Append General Gallery images as a pseudo-project
  const projectsWithImages = [...projects]
  if (gallerySingleton?.generalImages && gallerySingleton.generalImages.length > 0) {
    projectsWithImages.push({
      name: 'General Gallery',
      categoryTitle: 'Other',
      images: gallerySingleton.generalImages,
      videoUrls: [],
      youtubeIds: []
    })
  }
  const filteredProjectsWithImages = projectsWithImages.filter((p) => p.images.length > 0)

  // Append General Gallery videos as a pseudo-project
  const projectsWithVideos = [...projects]
  
  let generalYoutubeIds: string[] = []
  if (gallerySingleton?.generalYoutubeUrls) {
    generalYoutubeIds = gallerySingleton.generalYoutubeUrls.map(url => {
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
      return match ? match[1] : null
    }).filter(Boolean) as string[]
  }

  if ((gallerySingleton?.generalVideos && gallerySingleton.generalVideos.length > 0) || generalYoutubeIds.length > 0) {
    projectsWithVideos.push({
      name: 'General Videos',
      categoryTitle: 'Other',
      images: [],
      videoUrls: gallerySingleton?.generalVideos || [],
      youtubeIds: generalYoutubeIds
    })
  }
  
  const filteredProjectsWithVideos = projectsWithVideos.filter((p) => p.youtubeIds.length > 0 || p.videoUrls.length > 0)

  // Grouping helper
  const groupByCategory = (list: ProjectGallery[]) => {
    return list.reduce((acc, project) => {
      const cat = project.categoryTitle || 'Other Projects'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(project)
      return acc
    }, {} as Record<string, ProjectGallery[]>)
  }

  const groupedImages = groupByCategory(filteredProjectsWithImages)
  const groupedVideos = groupByCategory(filteredProjectsWithVideos)

  return (
    <div className="py-16 bg-[#f7f8fa]">
      <div className="max-w-[1600px] w-full px-4 sm:px-6 lg:px-8 lg:w-[95%] xl:w-[92%] mx-auto">
        {/* Main Toggle */}
        <div className="flex justify-start sm:justify-center mb-10 sm:mb-16 overflow-x-auto no-scrollbar pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          <div className="bg-white border border-[#e8ecf2] p-1.5 rounded-xl inline-flex shadow-sm min-w-max snap-center">
            <button
              onClick={() => setActiveTab('social_media')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-premium ${
                activeTab === 'social_media'
                  ? 'gradient-gold text-white shadow-md'
                  : 'text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Social Media
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-premium ${
                activeTab === 'photos'
                  ? 'gradient-gold text-white shadow-md'
                  : 'text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-semibold transition-premium ${
                activeTab === 'videos'
                  ? 'gradient-gold text-white shadow-md'
                  : 'text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8]'
              }`}
            >
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Videos
            </button>
          </div>
        </div>

        {/* Social Media Tab Content */}
        {activeTab === 'social_media' && (
          <div className="space-y-12">
            <section className="bg-white rounded-2xl shadow-sm border border-[#e8ecf2] overflow-hidden hover:shadow-md transition-premium duration-300 transform-gpu isolate">
              <div className="p-6 sm:p-8 border-b border-[#e8ecf2] flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33]">Instagram Updates</h2>
              </div>
              <div className="w-full bg-[#f7f8fa] h-[650px] sm:h-[700px]">
                <iframe 
                  src="https://widget.tagembed.com/328472?website=1" 
                  allowFullScreen 
                  loading="lazy"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Instagram Widget"
                ></iframe>
              </div>
            </section>

            {/* YouTube Row - Temporarily disabled
            <section className="bg-white rounded-2xl shadow-sm border border-[#e8ecf2] overflow-hidden hover:shadow-md transition-premium duration-300 transform-gpu isolate">
              <div className="p-6 sm:p-8 border-b border-[#e8ecf2] flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#ff0000]/10 flex items-center justify-center shadow-sm flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#ff0000]">
                    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.86-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M9.996,15.005l0-6.01l5.518,3.005L9.996,15.005z"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33]">YouTube Channel</h2>
              </div>
              <div className="w-full bg-white max-h-[500px] overflow-y-auto no-scrollbar sm:max-h-none sm:overflow-visible">
                <Script src="https://elfsightcdn.com/platform.js" strategy="lazyOnload" />
                <div className="elfsight-app-97410ef5-7df3-4af5-b235-e23c4b8062b1" data-elfsight-app-lazy></div>
              </div>
            </section>
            */}
          </div>
        )}

        {/* Photos Tab Content */}
        {activeTab === 'photos' && (
          <div className="space-y-20">
            {filteredProjectsWithImages.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-[#e8ecf2] mx-auto mb-4" />
                <p className="text-[#5a6a82] text-lg">No photos available at the moment.</p>
              </div>
            ) : (
              Object.entries(groupedImages).map(([category, catProjects], idx) => (
                <section key={idx} className="bg-white rounded-2xl shadow-sm border border-[#e8ecf2] overflow-hidden">
                  <div className="pt-8 sm:pt-10 mb-8 text-center px-4">
                    <p className="text-sm text-[#c4a55a] uppercase tracking-widest font-bold mb-2">Location</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#0f1d33]">{category}</h2>
                  </div>
                  
                  <div className="space-y-12 pb-8 sm:pb-10">
                    {catProjects.map((project, pIdx) => (
                      <div key={pIdx}>
                        <div className="px-8 sm:px-10 mb-6 border-b border-[#e8ecf2] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                          <h3 className="text-2xl font-bold text-[#c4a55a]">
                            {project.name}
                          </h3>
                          <p className="text-sm text-[#5a6a82]">{project.images.length} photo{project.images.length !== 1 ? 's' : ''}</p>
                        </div>
                        
                        {/* Slow scrolling marquee */}
                        <div className="overflow-hidden group/marquee w-full bg-[#f7f8fa] py-8 border-y border-[#e8ecf2]">
                          <div 
                            className={`flex gap-4 sm:gap-6 w-max px-4 sm:px-6 ${pIdx % 2 === 0 ? 'animate-scroll-left' : 'animate-scroll-right'} group-hover/marquee:[animation-play-state:paused]`}
                          >
                            {/* Duplicate images twice for seamless loop */}
                            {[...project.images, ...project.images].map((url, i) => {
                              const imageAlt = `${project.name} open plot layout in ${category} — site photo ${(i % project.images.length) + 1}`
                              return (
                              <div
                                key={i}
                                className="flex-shrink-0 w-64 sm:w-72 md:w-80 cursor-pointer group/card"
                                onClick={() => setLightboxImage({ url, alt: imageAlt })}
                              >
                                <div className="aspect-[4/3] bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden relative transition-premium group-hover/card:border-[#c4a55a]/30 group-hover/card:shadow-md">
                                  <Image
                                    src={url}
                                    alt={imageAlt}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-[#1e3a5f]/5 group-hover/card:bg-transparent transition-colors"></div>
                                </div>
                              </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* Videos Tab Content */}
        {activeTab === 'videos' && (
          <div className="space-y-12">
            {filteredProjectsWithVideos.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-[#e8ecf2] mx-auto mb-4" />
                <p className="text-[#5a6a82] text-lg">No videos available at the moment.</p>
              </div>
            ) : (
              Object.entries(groupedVideos).map(([category, catProjects], idx) => (
                <section key={idx} className="bg-white rounded-2xl shadow-sm border border-[#e8ecf2] p-6 sm:p-10">
                  <div className="mb-10 text-center">
                    <p className="text-sm text-[#c4a55a] uppercase tracking-widest font-bold mb-2">Location</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#0f1d33]">{category}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {catProjects.map((project, pIdx) => (
                      <div key={pIdx} className="contents">
                        {/* YouTube Videos */}
                        {project.youtubeIds.map((youtubeId, yIdx) => (
                          <div key={`yt-${pIdx}-${yIdx}`} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-premium h-fit">
                            <div className="aspect-video relative bg-[#f3f5f8]">
                              <iframe 
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={`${project.name} - YouTube Video ${yIdx + 1}`}
                                className="w-full h-full border-0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div className="p-4 sm:p-6">
                              <h3 className="text-lg font-bold text-[#0f1d33]">{project.name}</h3>
                              <p className="text-sm text-[#5a6a82] mt-1">YouTube Video</p>
                            </div>
                          </div>
                        ))}

                        {/* Uploaded Videos */}
                        {project.videoUrls.map((videoUrl, vIdx) => (
                          <div key={`vid-${pIdx}-${vIdx}`} className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-premium h-fit">
                            <div className="relative bg-black flex items-center justify-center">
                              <video 
                                src={videoUrl}
                                controls
                                className="w-full h-auto max-h-[70vh] object-contain"
                                preload="metadata"
                              />
                            </div>
                            <div className="p-4 sm:p-6">
                              <h3 className="text-lg font-bold text-[#0f1d33]">{project.name}</h3>
                              <p className="text-sm text-[#5a6a82] mt-1">Project Video</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-50"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full h-full max-w-5xl mx-auto max-h-[90vh]">
            <Image
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              fill
              className="object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

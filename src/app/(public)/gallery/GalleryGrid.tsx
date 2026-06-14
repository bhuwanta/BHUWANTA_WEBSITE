'use client'

import { useState } from 'react'
import { Play, Image as ImageIcon, Film, X } from 'lucide-react'
import Image from 'next/image'

interface ProjectGallery {
  name: string
  images: string[]
  videoUrl: string | null
  youtubeId: string | null
}

interface GalleryGridProps {
  projects: ProjectGallery[]
}

export function GalleryGrid({ projects = [] }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos')
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Filter projects that have images
  const projectsWithImages = projects.filter((p) => p.images.length > 0)
  // Filter projects that have videos
  const projectsWithVideos = projects.filter((p) => p.youtubeId || p.videoUrl)

  return (
    <div className="py-16 bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Toggle */}
        <div className="flex justify-center mb-16">
          <div className="bg-white border border-[#e8ecf2] p-1.5 rounded-xl inline-flex shadow-sm">
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-premium ${
                activeTab === 'photos'
                  ? 'gradient-gold text-white shadow-md'
                  : 'text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8]'
              }`}
            >
              <ImageIcon className="w-4 h-4" /> Photos
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-premium ${
                activeTab === 'videos'
                  ? 'gradient-gold text-white shadow-md'
                  : 'text-[#5a6a82] hover:text-[#0f1d33] hover:bg-[#f3f5f8]'
              }`}
            >
              <Film className="w-4 h-4" /> Videos
            </button>
          </div>
        </div>

        {/* Photos Tab Content */}
        {activeTab === 'photos' && (
          <div className="space-y-20">
            {projectsWithImages.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-[#e8ecf2] mx-auto mb-4" />
                <p className="text-[#5a6a82] text-lg">No photos available at the moment.</p>
              </div>
            ) : (
              projectsWithImages.map((project, idx) => (
                <section key={idx}>
                  <div className="mb-8 border-b border-[#e8ecf2] pb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33] mb-2">
                      {project.name}
                    </h2>
                    <p className="text-sm text-[#5a6a82]">{project.images.length} photo{project.images.length !== 1 ? 's' : ''}</p>
                  </div>
                  
                  {/* Slow scrolling marquee */}
                  <div className="overflow-hidden group/marquee">
                    <div 
                      className={`flex gap-4 sm:gap-6 w-max ${idx % 2 === 0 ? 'animate-scroll-left' : 'animate-scroll-right'} group-hover/marquee:[animation-play-state:paused]`}
                    >
                      {/* Duplicate images twice for seamless loop */}
                      {[...project.images, ...project.images].map((url, i) => (
                        <div 
                          key={i} 
                          className="flex-shrink-0 w-64 sm:w-72 md:w-80 cursor-pointer group/card"
                          onClick={() => setLightboxImage(url)}
                        >
                          <div className="aspect-[4/3] bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden relative transition-premium group-hover/card:border-[#c4a55a]/30 group-hover/card:shadow-md">
                            <Image 
                              src={url} 
                              alt={`${project.name} - Image ${(i % project.images.length) + 1}`}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                            />
                            <div className="absolute inset-0 bg-[#1e3a5f]/5 group-hover/card:bg-transparent transition-colors"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))
            )}
          </div>
        )}

        {/* Videos Tab Content */}
        {activeTab === 'videos' && (
          <div className="space-y-20">
            {projectsWithVideos.length === 0 ? (
              <div className="text-center py-12">
                <Film className="w-16 h-16 text-[#e8ecf2] mx-auto mb-4" />
                <p className="text-[#5a6a82] text-lg">No videos available at the moment.</p>
              </div>
            ) : (
              projectsWithVideos.map((project, idx) => (
                <section key={idx}>
                  <div className="mb-8 border-b border-[#e8ecf2] pb-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#0f1d33] mb-2">
                      {project.name}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* YouTube Video */}
                    {project.youtubeId && (
                      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-premium">
                        <div className="aspect-video relative bg-[#f3f5f8]">
                          <iframe 
                            src={`https://www.youtube.com/embed/${project.youtubeId}`}
                            title={`${project.name} - YouTube Video`}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg font-bold text-[#0f1d33]">{project.name}</h3>
                          <p className="text-sm text-[#5a6a82] mt-1">YouTube</p>
                        </div>
                      </div>
                    )}

                    {/* Uploaded Video */}
                    {project.videoUrl && (
                      <div className="bg-white border border-[#e8ecf2] shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-premium">
                        <div className="aspect-video relative bg-[#f3f5f8]">
                          <video 
                            src={project.videoUrl}
                            controls
                            className="w-full h-full object-cover"
                            preload="metadata"
                          />
                        </div>
                        <div className="p-4 sm:p-6">
                          <h3 className="text-lg font-bold text-[#0f1d33]">{project.name}</h3>
                          <p className="text-sm text-[#5a6a82] mt-1">Project Video</p>
                        </div>
                      </div>
                    )}
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
              src={lightboxImage} 
              alt="Gallery Image"
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

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Play } from 'lucide-react'

interface GalleryGridProps {
  images: Array<{ id: string; url: string; alt_text: string; category: string }>
  videos: Array<{ id: string; platform: string; video_id: string; title: string }>
}

export function GalleryGrid({ images, videos }: GalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeImage, setActiveImage] = useState<string | null>(null)

  const openLightbox = (url: string) => {
    setActiveImage(url)
    setLightboxOpen(true)
  }

  return (
    <>
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => openLightbox(img.url)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#e8ecf2] transition-premium hover:scale-[1.02] hover:shadow-xl hover:border-[#BA9832]/30"
            >
              <Image
                src={img.url}
                alt={img.alt_text || 'Gallery image'}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-[#002935]/0 group-hover:bg-[#002935]/30 transition-all duration-500" />
              {img.alt_text && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#002935]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-sm text-white font-medium">{img.alt_text}</p>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-[#002935] mb-6">Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-xl overflow-hidden border border-[#e8ecf2] shadow-sm">
                <div className="relative aspect-video">
                  {video.platform === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.video_id}`}
                      title={video.title || 'Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <iframe
                      src={`https://player.vimeo.com/video/${video.video_id}`}
                      title={video.title || 'Video'}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
                {video.title && (
                  <div className="p-4 flex items-center gap-2">
                    <Play className="w-4 h-4 text-[#BA9832]" />
                    <p className="text-sm font-medium text-[#002935]">{video.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Lightbox */}
      {lightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-[#002935]/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/60 hover:text-white p-2"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={activeImage}
              alt="Full size image"
              width={1920}
              height={1080}
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

interface Video {
  title: string
  videoId: string
}

interface YouTubeCarouselProps {
  videos: Video[]
}

export const YouTubeCarousel: React.FC<YouTubeCarouselProps> = ({ videos }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [playingIndex, setPlayingIndex] = useState<number | null>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)
  const animationRef = useRef<number | null>(null)
  const scrollSpeedRef = useRef(0.5)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  // Check scroll boundaries
  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }, [])

  // Duplicate videos for seamless infinite scroll
  const displayVideos = [...videos, ...videos, ...videos]

  // Auto-scroll animation loop
  useEffect(() => {
    const container = scrollRef.current
    if (!container || !isAutoScrolling || playingIndex !== null) return

    let lastTime = performance.now()
    const animate = (time: number) => {
      if (!container) return
      
      const deltaTime = time - lastTime
      lastTime = time
      
      // Smooth movement regardless of frame rate
      container.scrollLeft += (scrollSpeedRef.current * deltaTime) / 16

      // Seamless Loop: When we reach the second set of videos, jump back to the first set
      const singleSetWidth = container.scrollWidth / 3
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth
      }

      updateScrollButtons()
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isAutoScrolling, playingIndex, updateScrollButtons, videos.length])

  // Pause auto-scroll on hover
  const handleMouseEnter = () => {
    if (playingIndex === null) setIsAutoScrolling(false)
  }

  const handleMouseLeave = () => {
    if (playingIndex === null) setIsAutoScrolling(true)
  }

  // Manual scroll
  const scrollBy = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.85
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
    setTimeout(updateScrollButtons, 400)
  }

  // Handle video play/stop
  const handlePlay = (index: number) => {
    const realIndex = index % videos.length
    if (playingIndex === realIndex) {
      setPlayingIndex(null)
      setIsAutoScrolling(true)
    } else {
      setPlayingIndex(realIndex)
      setIsAutoScrolling(false)

      if (scrollRef.current) {
        const cards = scrollRef.current.querySelectorAll('[data-video-card]')
        const card = cards[index] as HTMLElement
        if (card) {
          const containerWidth = scrollRef.current.clientWidth
          const cardLeft = card.offsetLeft
          const cardWidth = card.offsetWidth
          scrollRef.current.scrollTo({
            left: cardLeft - (containerWidth - cardWidth) / 2,
            behavior: 'smooth',
          })
        }
      }
    }
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      <button
        onClick={() => scrollBy('left')}
        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 shadow-lg border border-[#e8ecf2] items-center justify-center text-[#002935] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scrollBy('right')}
        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/90 shadow-lg border border-[#e8ecf2] items-center justify-center text-[#002935] hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onScroll={updateScrollButtons}
        className="flex gap-6 overflow-x-auto scrollbar-hide px-4 sm:px-6 pb-4 snap-x snap-mandatory scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayVideos.map((video, i) => {
          const isPlaying = playingIndex === (i % videos.length)
          return (
            <div
              key={i}
              data-video-card
              className="flex-shrink-0 w-[85vw] sm:w-[60vw] md:w-[45vw] lg:w-[calc(33.333%-1rem)] snap-center"
            >
              <div className="relative rounded-2xl overflow-hidden bg-[#002935] border border-[#e8ecf2] shadow-lg aspect-video group/card">
                {isPlaying ? (
                  <div className="absolute inset-0">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                      style={{ border: 0 }}
                    />
                    <button
                      onClick={() => handlePlay(i)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <button
                      onClick={() => handlePlay(i)}
                      className="absolute inset-0 flex items-center justify-center z-10"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#7D651F] flex items-center justify-center shadow-xl hover:scale-110 hover:bg-[#F7D27D] transition-all duration-300">
                        <Play className="w-7 h-7 sm:w-8 sm:h-8 text-white ml-1" fill="white" />
                      </div>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 text-left">
                      <p className="text-white font-semibold text-sm sm:text-base leading-snug line-clamp-2">
                        {video.title}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Dot Indicators (Mobile) */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
        {videos.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              playingIndex === i ? 'bg-[#7D651F] w-4' : 'bg-[#002935]/20'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

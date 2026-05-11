import React from 'react'
import { Star } from 'lucide-react'

interface Review {
  name: string
  role: string
  rating: number
  content: string
}

interface ReviewsSectionProps {
  reviews: Review[]
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ reviews }) => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return null
  }

  // Duplicate reviews to create a seamless infinite scroll
  // We multiply it so there is always enough content to scroll smoothly on large screens
  const duplicatedReviews = [...reviews, ...reviews, ...reviews, ...reviews]

  return (
    <div className="w-full overflow-hidden relative pt-4 pb-12">
      {/* Edge Fade Masks for Smooth Marquee Entrance/Exit */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#0f1d33] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#0f1d33] to-transparent z-10 pointer-events-none" />

      <div className="animate-marquee flex gap-6 md:gap-8 hover:[animation-play-state:paused]">
        {duplicatedReviews.map((review, i) => (
          <div 
            key={i} 
            className="w-[320px] md:w-[400px] shrink-0 bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-lg hover:shadow-2xl hover:border-[#c4a55a]/50 hover:-translate-y-2 transition-all duration-500 flex flex-col min-h-[250px]"
          >
            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, starIndex) => (
                <Star 
                  key={starIndex} 
                  className={`w-4 h-4 ${starIndex < review.rating ? 'text-[#c4a55a] fill-[#c4a55a]' : 'text-white/20'}`} 
                />
              ))}
            </div>
            
            <p className="text-white/80 leading-relaxed mb-8 flex-grow text-sm md:text-base italic">
              "{review.content}"
            </p>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-gold flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#c4a55a]/20">
                {review.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm md:text-base">{review.name}</h4>
                <p className="text-xs md:text-sm text-white/60">{review.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

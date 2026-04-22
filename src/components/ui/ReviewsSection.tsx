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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {reviews.map((review, i) => (
        <div 
          key={i} 
          className="bg-white rounded-2xl p-8 border border-[#e8ecf2] shadow-sm hover:shadow-md transition-premium flex flex-col h-full"
        >
          {/* Rating */}
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, starIndex) => (
              <Star 
                key={starIndex} 
                className={`w-4 h-4 ${starIndex < review.rating ? 'text-[#7D651F] fill-[#7D651F]' : 'text-[#e8ecf2]'}`} 
              />
            ))}
          </div>
          
          <p className="text-[#5a6a82] leading-relaxed mb-8 flex-grow italic">
            "{review.content}"
          </p>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center text-white font-bold text-sm">
              {review.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-bold text-[#002935] text-sm">{review.name}</h4>
              <p className="text-xs text-[#5a6a82]">{review.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

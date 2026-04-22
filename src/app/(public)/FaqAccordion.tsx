'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqAccordionProps {
  items: Array<{ question: string; answer: string }>
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className={`bg-white rounded-xl border transition-all duration-300 ${
              isOpen ? 'border-[#BA9832]/30 shadow-md' : 'border-[#e8ecf2] hover:border-[#BA9832]/20'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="text-sm sm:text-base font-semibold text-[#002935] pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#BA9832] shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-6 pb-5 text-sm text-[#5a6a82] leading-relaxed border-t border-[#e8ecf2] pt-4">
                {item.answer}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

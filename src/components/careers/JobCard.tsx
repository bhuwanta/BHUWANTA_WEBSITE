'use client'

import React, { useState } from 'react'
import { MapPin, Briefcase, Calendar, ArrowRight, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'

interface JobListing {
  _id: string
  title: string
  department: string
  location: string
  employmentType: string
  description: string
  requirements: string[]
  applyUrl: string
  postedAt: string
}

export function JobCard({ job }: { job: JobListing }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div 
      className={`group bg-white border border-[#e8ecf2] rounded-2xl p-6 transition-all duration-300 flex flex-col h-full cursor-pointer hover:border-[#B69A4E]/30 ${isExpanded ? 'shadow-xl ring-1 ring-[#B69A4E]/20' : 'hover:shadow-lg'}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-[#B69A4E] font-semibold text-xs uppercase tracking-widest">{job.department}</p>
          <div className="flex items-center gap-1.5 text-[#5a6a82] text-[10px] font-medium uppercase tracking-wider">
            <Calendar className="w-3 h-3" />
            {new Date(job.postedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
        <h3 className="text-xl font-bold text-[#002935] group-hover:text-[#B69A4E] transition-colors">{job.title}</h3>
      </div>
      
      <p className={`text-[#5a6a82] text-sm leading-relaxed mb-6 ${isExpanded ? '' : 'line-clamp-2'}`}>
        {job.description}
      </p>

      {isExpanded && job.requirements && job.requirements.length > 0 && (
        <div className="mb-8 pt-6 border-t border-[#f3f5f8] animate-in fade-in slide-in-from-top-2 duration-300">
          <h4 className="text-sm font-bold text-[#002935] mb-4 uppercase tracking-wider">Who we're looking for</h4>
          <ul className="space-y-3">
            {job.requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-[#5a6a82]">
                <CheckCircle className="w-4 h-4 text-[#B69A4E] shrink-0 mt-0.5" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-[#f3f5f8] mt-auto">
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f3f5f8] rounded-md text-[#5a6a82] text-[10px] font-bold">
            <MapPin className="w-3 h-3" />
            {job.location}
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-[#f3f5f8] rounded-md text-[#5a6a82] text-[10px] font-bold">
            <Briefcase className="w-3 h-3" />
            {job.employmentType}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="text-[#B69A4E] hover:text-[#002935] transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <a 
            href={job.applyUrl}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#002935] hover:text-[#B69A4E] transition-colors group/btn shrink-0"
          >
            Apply
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  )
}

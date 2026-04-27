import React from 'react'

interface PageBannerProps {
  title: string
  subtitle?: string
}

export function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <section className="relative overflow-hidden bg-[#002935] luxury-bg-grid-white">
      {/* Navbar Safe Zone */}
      <div className="h-24 sm:h-32" />
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#B69A4E]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#B69A4E]/5 rounded-full blur-[120px]" />
      
      <div className="max-w-5xl mx-auto px-4 relative z-10 pb-10 sm:pb-14 text-center">
        <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight ${subtitle ? 'mb-4' : 'mb-0'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-base text-white/70 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B69A4E]/50 to-transparent" />
    </section>
  )
}

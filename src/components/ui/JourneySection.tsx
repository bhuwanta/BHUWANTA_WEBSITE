'use client'

import React, { useRef, useEffect, useState } from 'react'
import { DynamicIcon } from './DynamicIcon'

interface Step {
  icon: string
  title: string
  description: string
}

interface JourneySectionProps {
  steps: Step[]
}

export const JourneySection: React.FC<JourneySectionProps> = ({ steps }) => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(-1)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Stagger the steps one by one
          steps.forEach((_, i) => {
            setTimeout(() => setActiveStep(i), i * 600)
          })
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [steps])

  return (
    <div ref={sectionRef}>
      {/* === DESKTOP: Horizontal Timeline === */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Horizontal Line */}
          <div className="absolute top-[2.25rem] left-0 right-0 h-0.5 bg-[#e8ecf2]" />
          <div
            className="absolute top-[2.25rem] left-0 h-0.5 bg-gradient-to-r from-[#7D651F] to-[#F7D27D] transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, ((activeStep + 1) / steps.length) * 100)}%` }}
          />

          <div className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
            {steps.map((step, i) => {
              const isVisible = i <= activeStep

              return (
                <div
                  key={i}
                  className={`flex flex-col items-center text-center transition-all duration-700 ease-out ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                  }`}
                  style={{ transitionDelay: `${i * 200}ms` }}
                >
                  {/* Step Marker */}
                  <div className="relative mb-8 z-10">
                    <div
                      className={`w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                        isVisible
                          ? 'bg-[#7D651F] border-[#7D651F] shadow-xl shadow-[#7D651F]/25 scale-110'
                          : 'bg-white border-[#e8ecf2]'
                      }`}
                    >
                      <DynamicIcon
                        name={step.icon}
                        className={`w-7 h-7 transition-colors duration-500 ${
                          isVisible ? 'text-white' : 'text-[#5a6a82]'
                        }`}
                      />
                    </div>
                    {/* Number Badge */}
                    <div
                      className={`absolute -top-2 -right-2 w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all duration-500 z-20 ${
                        isVisible
                          ? 'bg-[#002935] text-white scale-110'
                          : 'bg-[#f8f9fb] text-[#5a6a82] border border-[#e8ecf2]'
                      }`}
                    >
                      {i + 1}
                    </div>
                  </div>

                  {/* Content Card */}
                  <div
                    className={`bg-white rounded-2xl p-6 lg:p-8 border shadow-sm transition-all duration-500 mx-2 ${
                      isVisible ? 'border-[#7D651F]/20 shadow-md' : 'border-[#e8ecf2]'
                    }`}
                  >
                    <h3
                      className={`text-lg lg:text-xl font-bold mb-3 transition-colors duration-500 ${
                        isVisible ? 'text-[#002935]' : 'text-[#5a6a82]'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#5a6a82] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* === MOBILE: Vertical Timeline (stacked for readability) === */}
      <div className="md:hidden relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-6 bottom-6 w-px bg-[#e8ecf2]" />
        <div
          className="absolute left-6 top-6 w-px bg-gradient-to-b from-[#7D651F] to-[#F7D27D] transition-all duration-1000 ease-out"
          style={{ height: `${Math.min(100, ((activeStep) / (steps.length - 1)) * 100)}%` }}
        />

        <div className="flex flex-col gap-10 relative z-10">
          {steps.map((step, i) => {
            const isVisible = i <= activeStep

            return (
              <div
                key={i}
                className={`flex items-start gap-5 transition-all duration-700 ease-out ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                {/* Marker */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border-2 ${
                      isVisible
                        ? 'bg-[#7D651F] border-[#7D651F] shadow-lg shadow-[#7D651F]/20'
                        : 'bg-white border-[#e8ecf2]'
                    }`}
                  >
                    <DynamicIcon
                      name={step.icon}
                      className={`w-5 h-5 transition-colors duration-500 ${
                        isVisible ? 'text-white' : 'text-[#5a6a82]'
                      }`}
                    />
                  </div>
                  <div
                    className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center transition-all duration-500 ${
                      isVisible ? 'bg-[#002935] text-white' : 'bg-[#f8f9fb] text-[#5a6a82] border border-[#e8ecf2]'
                    }`}
                  >
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <h3
                    className={`text-base font-bold mb-1.5 transition-colors duration-500 ${
                      isVisible ? 'text-[#002935]' : 'text-[#5a6a82]'
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#5a6a82] leading-relaxed">{step.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

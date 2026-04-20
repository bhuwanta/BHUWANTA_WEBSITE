'use client'

import React from 'react'

export default function SentryExamplePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fb] p-8">
      <div className="bg-white p-8 rounded-2xl shadow-premium border border-[#e8ecf2] max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[#002935] mb-4">Sentry Test Page</h1>
        <p className="text-[#5a6a82] mb-8">
          Use the button below to trigger a test error and verify that Sentry is correctly tracking issues.
        </p>
        
        <button
          type="button"
          onClick={() => {
            throw new Error('Sentry Test Error: Everything is working correctly!')
          }}
          className="w-full px-6 py-3 rounded-lg gradient-gold text-white font-semibold transition-premium hover:scale-105 glow-gold"
        >
          Trigger Test Error
        </button>
        
        <div className="mt-8 pt-6 border-t border-[#e8ecf2] text-xs text-[#5a6a82]/60">
          <p>After clicking, check your Sentry dashboard to see if the error appears.</p>
        </div>
      </div>
    </div>
  )
}

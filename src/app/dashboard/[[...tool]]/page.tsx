'use client'

import { NextStudio } from 'next-sanity/studio'
import config from '@/../sanity.config'

export default function BlogStudioPage() {
  return (
    <div className="w-full h-full">
      <NextStudio config={config} />
    </div>
  )
}

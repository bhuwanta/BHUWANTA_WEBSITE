'use client'

import Image, { ImageProps } from 'next/image'
import { sanityImageLoader } from '@/lib/sanity'

export function SanityImage(props: ImageProps) {
  // If the source is a Sanity CDN URL, use our custom loader
  const isSanity = typeof props.src === 'string' && props.src.includes('cdn.sanity.io')
  
  return (
    <Image
      {...props}
      loader={isSanity ? sanityImageLoader : undefined}
    />
  )
}

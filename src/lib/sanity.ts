import { createClient, type QueryParams } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = imageUrlBuilder(client)
export function urlFor(source: any) {
  return builder.image(source)
}

// Client for secured API mutations
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false, // Bypassing CDN for accurate mutations
})

// Helper to fetch with type safety
export async function sanityFetch<T>({
  query,
  params = {},
  tags = [],
}: {
  query: string
  params?: QueryParams
  tags?: string[]
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      tags,
    },
  })
}

// ================================
// GROQ Queries for each page
// ================================

export const homeQuery = `*[_type == "home"][0]{
  heroHeading,
  heroSubheading,
  heroCta,
  heroImage,
  featuredSectionHeading,
  featuredProjects,
  aboutTeaser,
  ctaBannerHeading,
  ctaBannerSubtext
}`

export const aboutQuery = `*[_type == "about"][0]{
  companyStory,
  missionStatement,
  teamMembers[]{
    name,
    role,
    bio,
    image
  }
}`

export const galleryQuery = `*[_type == "gallery"][0]{
  pageHeading,
  sectionHeadings,
  images[]{
    alt,
    asset->{ url }
  },
  youtubeVideos[]{
    title,
    url
  }
}`

export const projectsQuery = `*[_type == "projects"][0]{
  sectionHeading,
  projectEntries[]{
    name,
    description,
    specs,
    statusText,
    image
  }
}`

export const blogListQuery = `*[_type == "blog"] | order(publishDate desc){
  title,
  slug,
  excerpt,
  tags,
  publishDate,
  metaTitle,
  metaDescription
}`

export const blogPostQuery = `*[_type == "blog" && slug.current == $slug][0]{
  title,
  slug,
  body,
  tags,
  publishDate,
  metaTitle,
  metaDescription,
  ogImage,
  canonicalUrl,
  focusKeyword
}`

export const careersQuery = `*[_type == "careers"][0]{
  introText,
  cultureCopy,
  benefitsCopy,
  whyWorkCopy
}`

export const contactQuery = `*[_type == "contact"][0]{
  pageHeading,
  formLabels,
  thankYouMessage
}`

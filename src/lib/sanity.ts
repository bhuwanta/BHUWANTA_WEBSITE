import { createClient, type QueryParams } from 'next-sanity'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
})

const builder = createImageUrlBuilder(client)
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
  // Hero
  heroPrimaryCta,
  heroSecondaryCta,
  heroPhoneNumber,
  heroImages[] {
    image {
      asset->{
        url
      }
    },
    asset->{
      url
    },
    text
  },
  // Why Choose
  whyChooseHeading,
  whyChooseSubheading,
  whyChooseFeatures[]{ icon, title },
  // Featured Projects
  featuredProjectsHeading,
  featuredProjectsSubheading,
  featuredProjects[]{ name, tag, "imageUrl": image.asset->url },
  featuredProjectsFooterText,
  // Journey
  journeyHeading,
  journeyHeadingHighlight,
  journeySteps[]{ stepNumber, title, description },
  // Certifications
  certificationsHeading,
  certificationsSubheading,
  certifications[]{ icon, title },
  // Testimonials
  testimonialsHeading,
  testimonialsSubheading,
  youtubeVideos[]{ title, videoId },
  // Site Visit
  siteVisitHeading,
  siteVisitSubheading,
  siteVisitPhone,
  siteVisitWhatsappHours
}`

export const aboutQuery = `*[_type == "about"][0]{
  // Banner
  pageHeading,
  pageSubtitle,
  // Our Story
  storyHeading,
  storyParagraphs,
  storyImage {
    asset->{
      url
    }
  },
  // Mission & Vision
  missionTitle,
  missionBody,
  visionTitle,
  visionBody,
  // Core Values
  coreValues[]{ title, description },
  // Leadership
  leadershipHeading,
  leaders[]{ name, role, bio },
  // Strengths
  strengthsHeading,
  strengths[]{ title, description },
  // CTA
  ctaTitle,
  ctaDescription
}`

export const galleryQuery = `*[_type == "projects"][0]{
  projectEntries[]{
    name,
    "images": images[].asset->url,
    "videoUrl": videoFile.asset->url,
    youtubeUrl
  }
}`

export const projectsQuery = `*[_type == "projects"][0]{
  pageHeading,
  projectEntries[]{
    name,
    "category": category->slug.current,
    "categoryTitle": category->title,
    slug,
    location,
    googleMapsUrl,
    description,
    "images": images[].asset->url,
    "videoUrl": videoFile.asset->url,
    youtubeUrl,
    projectHighlights,
    "brochureUrl": brochure.asset->url,
    approvalBadge
  }
}`

export const projectCategoriesQuery = `*[_type == "projectCategory"] | order(order asc){
  "id": slug.current,
  title,
  "label": title,
  order,
  image {
    asset->{
      url
    }
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

export const contactQuery = `*[_type == "contact"][0]{
  pageHeading,
  pageSubheading,
  formLabels,
  queryOptions,
  thankYouMessage,
  whatsappLink,
  googleMapsEmbed
}`

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteName,
  tagline,
  logo,
  favicon,
  navLinks[]{ label, href },
  ctaButtonText,
  ctaButtonLink,
  footerAddress,
  footerAddressLabel,
  googleMapsUrl,
  footerPhone,
  footerEmail,
  copyrightText,
  metaTitleTemplate,
  defaultMetaDescription,
  defaultOgImage,
  googleSiteVerification,
  socialLinks,
  googleAnalyticsId,
  googleTagManagerId,
  metaPixelId
}`
export const autoresponderQuery = `*[_type == "autoresponder"][0]{
  fromName,
  fromEmail,
  subjectLine,
  "logoUrl": logo.asset->url,
  messageBody,
  "attachmentUrl": attachmentFile.asset->url,
  "attachmentFilename": attachmentFile.asset->originalFilename
}
`

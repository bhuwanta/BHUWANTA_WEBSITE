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
  heroHeading,
  heroSubheading,
  heroImage,
  heroPrimaryCta,
  heroSecondaryCta,
  trustBadges[]{ label },
  whyOwnLandHeading,
  whyOwnLandSubheading,
  whyOwnLandCards[]{ icon, title, description },
  vastuHeading,
  vastuSubheading,
  vastuCards[]{ icon, title, description },
  journeyHeading,
  journeySubheading,
  journeySteps[]{ icon, title, description },
  reviewsHeading,
  reviews[]{ name, role, rating, content },
  mapFeatures[]{ icon, title, distance },
  mapLocationDescription,
  youtubeVideos[]{ title, videoId },
  faqHeading,
  faqItems[]{ question, answer },
  finalCtaHeading,
  finalCtaSubtext,
  finalCtaSupportingText
}`

export const aboutQuery = `*[_type == "about"][0]{
  whoWeAreHeading,
  whoWeAreBody,
  visionHeading,
  visionBody,
  missionHeading,
  missionBody,
  missionCommitments[]{ title, description },
  whyChooseHeading,
  differentiators[]{ title, description },
  legalHeading,
  legalBody,
  legalCommitments,
  closingLine,
  closingContact
}`

export const galleryQuery = `*[_type == "gallery"][0]{
  pageHeading,
  pageSubheading,
  images[]{
    alt,
    category,
    asset->{ url }
  },
  youtubeVideos[]{
    title,
    url
  },
  devUpdateHeading,
  devUpdateBody
}`

export const projectsQuery = `*[_type == "projects"][0]{
  pageHeading,
  pageSubheading,
  projectEntries[]{
    name,
    slug,
    location,
    description,
    image,
    masterLayoutImage,
    plotSizes,
    pricePerSqYd,
    hmdaLpNumber,
    reraNumber,
    statusText,
    plotDetails[]{ plotSize, area, pricePerSqYd, totalPrice },
    amenities[]{ icon, label },
    locationHighlights[]{ icon, label },
    approvals[]{ label, detail }
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
  pageHeading,
  pageSubheading,
  bodyText,
  whatWeLookFor,
  applyEmail,
  footerNote
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

export const jobListingsQuery = `*[_type == "jobListing" && isActive == true] | order(postedAt desc){
  _id,
  title,
  department,
  location,
  employmentType,
  salaryMin,
  salaryMax,
  description,
  requirements,
  applyUrl,
  postedAt
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

import { MetadataRoute } from 'next'
import { sanityFetch, blogListQuery, projectSlugsQuery } from '@/lib/sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'

  const routes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/projects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/gallery`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/hmda-vs-dtcp-plots-hyderabad`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]

  // Add dynamic blog slugs
  try {
    const posts = await sanityFetch<{ slug: { current: string }, publishDate: string }[]>({
      query: blogListQuery,
      tags: ['blog']
    })

    if (posts) {
      posts.forEach(post => {
        if (post.slug?.current) {
          routes.push({
            url: `${siteUrl}/blog/${post.slug.current}`,
            lastModified: new Date(post.publishDate || Date.now()),
            changeFrequency: 'weekly',
            priority: 0.7
          })
        }
      })
    }
  } catch { /* Ignore fetching errors for sitemap */ }

  // Add dynamic project slugs
  try {
    const projectSlugs = await sanityFetch<string[]>({
      query: projectSlugsQuery,
      tags: ['projects']
    })

    if (projectSlugs) {
      projectSlugs.forEach(slug => {
        routes.push({
          url: `${siteUrl}/projects/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8
        })
      })
    }
  } catch { /* Ignore fetching errors for sitemap */ }

  return routes
}

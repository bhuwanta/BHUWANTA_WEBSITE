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
    { url: `${siteUrl}/shabad-open-plots`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/shadnagar-open-plots`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/blog/open-plots-shabad-hyderabad-hmda-approved-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/dtcp-vs-hmda-plots-shadnagar-buyer-guide`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/shabad-vs-shadnagar-investment-comparison`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog/open-plots-shadnagar-growth-story-2026`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/resources/hyderabad-plot-buyer-legal-checklist`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/resources/nh44-growth-corridor-investment-map`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Hand-authored /projects/<slug> pages that exist as static routes today,
  // independent of whether the Sanity slug field has been set for these
  // projects yet (see KNOWN_PROJECT_SLUGS in ProjectsFilterClient.tsx).
  const staticProjectSlugs = ['sv-kanaka-maple-homes', 'tjr-township', 'vaibhav-county', 'vian-vally']
  staticProjectSlugs.forEach(slug => {
    routes.push({
      url: `${siteUrl}/projects/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8
    })
  })

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
        // Skip slugs already covered by the hand-authored static pages above
        // (an editor may eventually set a matching CMS slug for one of them).
        if (staticProjectSlugs.includes(slug)) return
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

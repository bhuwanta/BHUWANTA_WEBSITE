import { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  
  let allowRules = ['/']
  let disallowRules = ['/dashboard', '/studio', '/api']
  
  // Try to fetch custom rules from Supabase (maybe later we can adjust)
  // For now we use the required defaults from the implementation plan

  return {
    rules: {
      userAgent: '*',
      allow: allowRules,
      disallow: disallowRules,
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

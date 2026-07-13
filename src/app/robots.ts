import { MetadataRoute } from 'next'

const AI_CRAWLER_AGENTS = [
  'GPTBot',
  'ChatGPT-User',
  'Google-Extended',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'CCBot',
  'Bingbot',
]

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'

  const allowRules = ['/']
  const disallowRules = ['/dashboard', '/api', '/studio', '/crm', '/thank-you']

  return {
    rules: [
      { userAgent: '*', allow: allowRules, disallow: disallowRules },
      ...AI_CRAWLER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: allowRules,
        disallow: disallowRules,
      })),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}

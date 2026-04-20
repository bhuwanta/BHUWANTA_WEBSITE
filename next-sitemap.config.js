/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com',
  generateRobotsTxt: false, // We're using app/robots.ts dynamically
  exclude: ['/dashboard*', '/studio*'],
  changefreq: 'daily',
  priority: 0.7,
  // Add additional paths if needed
}

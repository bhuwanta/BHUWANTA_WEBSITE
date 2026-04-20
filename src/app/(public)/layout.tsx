import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { JsonLd, buildWebSiteSchema, buildOrganizationSchema } from '@/components/seo/JsonLd'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'

  const websiteSchema = buildWebSiteSchema({
    name: 'Bhuwanta',
    url: siteUrl,
  })

  const orgSchema = buildOrganizationSchema({
    name: 'Bhuwanta',
    url: siteUrl,
    description: 'Premium real estate solutions by Bhuwanta',
  })

  return (
    <>
      <JsonLd data={[websiteSchema, orgSchema]} />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

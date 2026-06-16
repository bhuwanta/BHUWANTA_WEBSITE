import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { DynamicClientComponents } from '@/components/ui/DynamicClientComponents'
import { JsonLd, buildWebSiteSchema, buildOrganizationSchema } from '@/components/seo/JsonLd'
import Script from 'next/script'
import { sanityFetch, siteSettingsQuery, projectsQuery } from '@/lib/sanity'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let settings: any = null
  let projectsData: any = null
  try {
    settings = await sanityFetch({ query: siteSettingsQuery, tags: ['siteSettings'] })
    projectsData = await sanityFetch({ query: projectsQuery, tags: ['projects'] })
  } catch { /* fallback */ }

  const uniqueProjectNames = Array.from(new Set(
    (projectsData?.projectEntries || [])
      .map((p: any) => p.categoryTitle)
      .filter(Boolean)
  )) as string[]

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

      {/* Google Analytics — uses Sanity setting with hardcoded fallback */}
      {(() => {
        const gaId = settings?.googleAnalyticsId || 'G-98QJJZ5DCG';
        return (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        );
      })()}

      {settings?.googleTagManagerId && (
        <Script id="google-tag-manager" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${settings.googleTagManagerId}');
          `}
        </Script>
      )}

      {settings?.metaPixelId && (
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      <Navbar />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <DynamicClientComponents projectNames={uniqueProjectNames} />
    </>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PostHogProvider } from '@/lib/posthog'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Bhuwanta | Luxury Living Redefined',
    template: '%s | Bhuwanta',
  },
  description: 'Experience unparalleled luxury with Bhuwanta. Discover exclusive residential projects and premium properties designed for the modern lifestyle.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    siteName: 'Bhuwanta',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans antialiased flex flex-col min-h-screen overflow-x-hidden`}>
        <PostHogProvider>
          {children}
          <Toaster richColors position="top-right" />
        </PostHogProvider>
      </body>
    </html>
  )
}

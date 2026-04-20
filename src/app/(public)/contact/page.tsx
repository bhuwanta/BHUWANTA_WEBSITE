import { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, contactQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { ContactForm } from './ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('contact', 'Contact Us', 'Get in touch with Bhuwanta. Schedule a consultation, inquire about properties, or just say hello.')
}

export default async function ContactPage() {
  let data = {
    pageHeading: 'Get in Touch',
    formLabels: {
      name: 'Your Name',
      email: 'Email Address',
      phone: 'Phone Number',
      message: 'Your Message',
      interest: 'Property Interest',
      submit: 'Send Message',
    },
    thankYouMessage: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
  }

  try {
    const sanityData = await sanityFetch<typeof data>({ query: contactQuery, tags: ['contact'] })
    if (sanityData) data = { ...data, ...sanityData }
  } catch { /* fallback */ }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bhuwanta.com'
  const breadcrumb = buildBreadcrumbSchema([
    { name: 'Home', url: siteUrl },
    { name: 'Contact', url: `${siteUrl}/contact` },
  ])

  return (
    <>
      <JsonLd data={breadcrumb} />

      {/* Hero */}
      <section className="pt-32 pb-16 section-padding relative bg-[#f8f9fb]">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#003d4f]/3 rounded-full blur-[150px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="text-sm font-semibold text-[#BA9832] mb-4 tracking-wider uppercase">Reach Out</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            {data.pageHeading?.split(' ').slice(0, -1).join(' ') || 'Get in'}{' '}
            <span className="text-gradient">{data.pageHeading?.split(' ').slice(-1)[0] || 'Touch'}</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            Have a question or ready to explore our properties? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {[
                { icon: MapPin, label: 'Visit Us', value: 'Bhuwanta Office\nYour City, State, India' },
                { icon: Phone, label: 'Call Us', value: '+91 XXXXX XXXXX' },
                { icon: Mail, label: 'Email Us', value: 'info@bhuwanta.com' },
                { icon: Clock, label: 'Working Hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM\nSunday: By Appointment' },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-5 flex items-start gap-4 transition-premium hover:border-[#BA9832]/30 hover:shadow-md">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002935] mb-1">{item.label}</p>
                    <p className="text-sm text-[#5a6a82] whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-2xl p-8">
                <ContactForm
                  labels={data.formLabels}
                  thankYouMessage={data.thankYouMessage}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

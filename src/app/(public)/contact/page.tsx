import { Metadata } from 'next'
import { MapPin, Phone, Mail, MessageCircle, Clock } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, contactQuery } from '@/lib/sanity'
import { JsonLd, buildBreadcrumbSchema } from '@/components/seo/JsonLd'
import { ContactForm } from './ContactForm'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('contact', 'Contact Us', 'Whether you have a question, want to book a site visit, or just want to learn more about HMDA-approved plots in Hyderabad — we\'re here.')
}

export default async function ContactPage() {
  let data = {
    pageHeading: "Let's Talk",
    pageSubheading: "Whether you have a question, want to book a site visit, or just want to learn more — we're here.",
    formLabels: {
      name: 'Full Name',
      phone: 'Phone Number',
      email: 'Email Address',
      query: 'Your Query',
      message: 'Message',
      submit: 'Send Message',
    },
    queryOptions: ['Site Visit', 'Project Info', 'Investment Query', 'Other'],
    thankYouMessage: 'Thank you for reaching out! Our team will get back to you within 24 hours.',
    whatsappLink: '',
    googleMapsEmbed: '',
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#002935]">
            {data.pageHeading?.split(' ').slice(0, -1).join(' ') || "Let's"}{' '}
            <span className="text-gradient">{data.pageHeading?.split(' ').slice(-1)[0] || 'Talk'}</span>
          </h1>
          <p className="text-lg text-[#5a6a82] max-w-2xl mx-auto">
            {data.pageSubheading}
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding pt-0 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {[
                { icon: Phone, label: 'Call Us', value: '[PHONE NUMBER]', href: 'tel:+91XXXXXXXXXX' },
                { icon: Mail, label: 'Email Us', value: 'info@bhuwanta.com', href: 'mailto:info@bhuwanta.com' },
                { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', href: data.whatsappLink || 'https://wa.me/91XXXXXXXXXX' },
                { icon: MapPin, label: 'Visit Us', value: '[OFFICE ADDRESS],\nHyderabad, Telangana', href: undefined },
                { icon: Clock, label: 'Working Hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM\nSunday: By Appointment', href: undefined },
              ].map((item) => (
                <div key={item.label} className="glass-card rounded-xl p-5 flex items-start gap-4 transition-premium hover:border-[#BA9832]/30 hover:shadow-md">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#002935] mb-1">{item.label}</p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-[#5a6a82] hover:text-[#BA9832] transition-colors whitespace-pre-line"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-[#5a6a82] whitespace-pre-line">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="glass-card rounded-2xl p-8">
                <ContactForm
                  labels={data.formLabels}
                  queryOptions={data.queryOptions}
                  thankYouMessage={data.thankYouMessage}
                />
              </div>
            </div>
          </div>

          {/* Google Maps Embed */}
          {data.googleMapsEmbed && (
            <div className="mt-12 rounded-2xl overflow-hidden border border-[#e8ecf2]">
              <iframe
                src={data.googleMapsEmbed}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bhuwanta Office Location"
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}

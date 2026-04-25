import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, MessageCircle, ChevronDown } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, homeQuery } from '@/lib/sanity'
import { FaqAccordion } from './FaqAccordion'
import { ProjectRegistrationForm } from './ProjectRegistrationForm'
import { BrochureRegistrationForm } from './BrochureRegistrationForm'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { JourneySection } from '@/components/ui/JourneySection'
import { ReviewsSection } from '@/components/ui/ReviewsSection'
import { MapSection } from '@/components/ui/MapSection'
import { YouTubeCarousel } from '@/components/ui/YouTubeCarousel'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('home', 'HMDA Approved Plots in Hyderabad', 'Own HMDA-approved, Vastu-aligned plots in Hyderabad\'s fastest-growing corridors. Designed for homebuilders and smart investors. Book a free site visit today.')
}

export const revalidate = 60

// Fallback content
const fallback = {
  heroHeading: 'Redefining | Luxury Living.',
  heroSubheading: 'HMDA-approved plots in Hyderabad\'s fastest-growing corridors — designed for homebuilders and smart investors alike.',
  heroPrimaryCta: 'Book Free Site Visit',
  heroSecondaryCta: 'Call Now',

  whyOwnLandHeading: 'Why Choose Bhuwanta?',
  whyOwnLandSubheading: 'We don\'t just sell land. We provide a secure foundation for your family\'s future and your wealth.',
  whyOwnLandCards: [
    { icon: 'ShieldCheck', title: 'Unquestionable Legality', description: 'No disputes. No doubts. Every plot we sell has a 100% clear title, complete legal verification, and HMDA approval.' },
    { icon: 'Building2', title: 'Premium Infrastructure', description: 'Wide internal roads, underground cabling, dedicated water supply, and beautiful landscaping ready from day one.' },
    { icon: 'TrendingUp', title: 'High Appreciation Zones', description: 'We exclusively acquire land in areas proven to yield the highest return on investment over the next decade.' },
    { icon: 'Eye', title: 'Complete Transparency', description: 'No hidden fees, no last-minute surprises. What you see is exactly what you pay for and what you own.' },
  ],

  vastuHeading: 'Rooted in Tradition. Designed for Prosperity.',
  vastuSubheading: 'A home should bring peace. Our entire master layout is meticulously planned alongside leading Vastu experts to ensure positive energy flows through every plot.',
  vastuCards: [
    { icon: 'Compass', title: 'Auspicious Entrances', description: 'Every plot orientation is optimized for favorable facing directions to invite wealth and health.' },
    { icon: 'Maximize', title: 'Perfect Proportions', description: 'Plot dimensions are cut to precise Vastu ratios, avoiding irregular shapes that disrupt harmony.' },
    { icon: 'TreePine', title: 'Natural Elements', description: 'Parks, water bodies, and open spaces are strategically placed according to the five elements of nature.' },
    { icon: 'Wind', title: 'Energy Flow', description: 'Wide streets and thoughtful spacing ensure uninterrupted natural light and cross-ventilation for every future home.' },
  ],

  journeyHeading: 'Your Journey to Ownership',
  journeySubheading: 'We have simplified the process of buying land so you can secure your asset without the usual stress.',
  journeySteps: [
    { icon: 'CalendarDays', title: 'Schedule a Visit', description: 'Book a free guided tour of the property. We will walk you through the exact plot locations and boundaries.' },
    { icon: 'FileText', title: 'Review the Documents', description: 'We hand you the complete legal file. Take your time, consult your lawyer, and verify our clear titles.' },
    { icon: 'PenTool', title: 'Register Your Plot', description: 'Choose your payment plan. Once finalized, we handle the entire registration process smoothly and hand over your documents.' },
  ],

  reviewsHeading: 'What Our Buyers Say',
  reviews: [
    { name: 'Rahul R.', role: 'Tech Professional', rating: 5, content: 'I was nervous about buying land because of legal issues, but the team at Bhuwanta was completely transparent. They gave me all the HMDA documents on day one. Very happy with my investment.' },
    { name: 'Priya S.', role: 'Business Owner', rating: 5, content: 'The layout development is top notch. The roads are wide, the Vastu compliance is genuine, and the location is exactly where Hyderabad is expanding next.' },
    { name: 'Vikram Reddy', role: 'NRI Investor', rating: 5, content: 'Smooth registration process from start to finish. They handled all the paperwork and made sure I understood everything. Highly recommend them if you want peace of mind.' },
  ],

  mapFeatures: [
    { icon: 'building', title: 'Major IT Hubs', distance: '15 Minutes Drive' },
    { icon: 'navigation', title: 'Highway Access', distance: 'Direct Connectivity' },
    { icon: 'map-pin', title: 'Schools & Hospitals', distance: 'Within 5km Radius' },
  ],
  mapLocationDescription: 'Explore our meticulously planned layout situated in the heart of Hyderabad\'s fastest-growing real estate corridor. Every plot is perfectly positioned for high appreciation and peaceful living.',

  trustBadges: [
    { label: 'HMDA Approved Layouts' },
    { label: 'RERA Registered Developer' },
    { label: '100% Clear Titles' },
    { label: 'Verified Vastu Compliance' },
  ],

  youtubeVideos: [
    { title: 'Bhuwanta Project Walkthrough', videoId: 'dQw4w9WgXcQ' },
    { title: 'Site Development Progress', videoId: 'dQw4w9WgXcQ' },
    { title: 'Customer Testimonial', videoId: 'dQw4w9WgXcQ' },
  ],

  faqHeading: 'Frequently Asked Questions',
  faqItems: [
    { question: 'Are the plots legally clear and approved?', answer: 'Yes. Every single plot is fully approved by HMDA and comes with a 100% clear title and encumbrance certificate.' },
    { question: 'Can I get a bank loan for this?', answer: 'Absolutely. Because our legal documentation is perfect, all leading banks provide fast loan approvals for our properties.' },
    { question: 'When can I start building my house?', answer: 'You can start construction the very same day your registration is complete. The infrastructure is already in place.' },
    { question: 'Are there any hidden maintenance charges?', answer: 'No. We believe in total pricing transparency. All costs are discussed openly before you make any commitment.' },
  ],

  finalCtaHeading: 'Let\'s Secure Your Plot',
  finalCtaSubtext: 'Plots in this premium layout are selling fast. Reach out to us today to check availability and schedule your visit.',
  finalCtaSupportingText: '📞 +91 99999 99999  |  ✉️ info@bhuwanta.com',
}

export default async function HomePage() {
  let data = fallback
  try {
    const sanityData = await sanityFetch<typeof fallback>({ query: homeQuery, tags: ['home'] })
    if (sanityData) data = { ...fallback, ...sanityData }
  } catch {
    // Use fallback
  }

  return (
    <>
      {/* ===== SECTION 1 — HERO BANNER ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#7D651F]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#7D651F]/5 blur-[120px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] mb-6 sm:mb-8">
            <span className="text-white">Redefining</span>
            <br />
            <span className="text-gradient">Luxury Living.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            {data.heroSubheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              id="hero-cta-primary"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white transition-premium hover:scale-105 glow-gold"
            >
              Book a Free Site Visit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+91XXXXXXXXXX"
              id="hero-cta-secondary"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl bg-white text-[#002935] hover:bg-white/90 transition-premium shadow-lg"
            >
              Call Now
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-white/60 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/80" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Scroll</span>
        </div>
      </section>
    </>
  )
}

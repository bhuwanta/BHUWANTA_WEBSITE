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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
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

      {/* ===== SECTION 2 — HMDA TRUST MARQUEE ===== */}
      <section className="bg-white border-b border-[#e8ecf2] overflow-hidden py-5 sm:py-6" id="trust-bar">
        <div className="animate-marquee gap-6 sm:gap-8 px-4 flex">
          {[...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges)].map((badge, i) => (
            <div key={i} className="flex items-center justify-center gap-3 px-5 sm:px-6 py-3 rounded-xl bg-[#f8f9fb] border border-[#e8ecf2] whitespace-nowrap">
              <span className="text-[#7D651F]"><DynamicIcon name={['ShieldCheck', 'Building2', 'Compass', 'CheckCircle'][i % 4] || 'CheckCircle'} className="w-5 h-5" /></span>
              <span className="text-xs sm:text-sm font-semibold text-[#002935]">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 3 — WHY CHOOSE BHUWANTA ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-[#f8f9fb] luxury-bg-topography" id="why-choose-us">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">The Smart Investment</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              Why Choose <span className="text-gradient">Bhuwanta</span>?
            </h2>
            <p className="text-base sm:text-lg text-[#5a6a82] max-w-3xl mx-auto leading-relaxed">
              {data.whyOwnLandSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(data.whyOwnLandCards || fallback.whyOwnLandCards).map((card, i) => (
              <div
                key={i}
                className="glass-card bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ecf2] group transition-premium hover:border-[#7D651F]/30 hover:scale-[1.02] hover:shadow-lg flex flex-col items-center text-center"
              >
                <span className="text-3xl mb-4 block text-[#7D651F]">
                  <DynamicIcon name={card.icon} className="w-8 h-8" />
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#002935] mb-3">{card.title}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4 — MAP SECTION ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-white luxury-bg-grid" id="map">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">Location</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              Prime Land. <span className="text-gradient">Strategic Location.</span>
            </h2>
          </div>

          <MapSection
            features={data.mapFeatures || fallback.mapFeatures}
            location={data.mapLocationDescription || fallback.mapLocationDescription}
          />
        </div>
      </section>

      {/* ===== SECTION 5 — VASTU-COMPLIANT ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-[#f8f9fb]" id="vastu">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">Vastu-Compliant</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              Rooted in Tradition. <span className="text-gradient">Designed for Prosperity.</span>
            </h2>
            <p className="text-base sm:text-lg text-[#5a6a82] max-w-3xl mx-auto leading-relaxed">
              {data.vastuSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {(data.vastuCards || fallback.vastuCards).map((card, i) => (
              <div
                key={i}
                className="glass-card bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ecf2] group transition-premium hover:border-[#7D651F]/30 hover:shadow-lg flex flex-col items-center text-center"
              >
                <span className="text-3xl mb-4 block text-[#7D651F]">
                  <DynamicIcon name={card.icon} className="w-8 h-8" />
                </span>
                <h3 className="text-base sm:text-lg font-semibold text-[#002935] mb-3">{card.title}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6 — YOUR JOURNEY ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-white overflow-hidden" id="journey">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              Your Journey to <span className="text-gradient">Ownership</span>
            </h2>
            <p className="text-base sm:text-lg text-[#5a6a82] max-w-3xl mx-auto leading-relaxed">
              {data.journeySubheading}
            </p>
          </div>

          <JourneySection steps={data.journeySteps || fallback.journeySteps} />
        </div>
      </section>

      {/* ===== SECTION 7 — CERTIFICATIONS MARQUEE ===== */}
      <section className="bg-[#002935] overflow-hidden py-10 sm:py-14" id="certifications">
        <div className="absolute inset-0 noise-overlay" />
        <div className="text-center mb-8 sm:mb-10 relative z-10 px-4">
          <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase">Trusted & Certified</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white luxury-heading">
            Backed by Every <span className="text-[#7D651F]">Approval That Matters</span>
          </h2>
        </div>
        <div className="animate-marquee gap-6 sm:gap-8 px-4 flex relative z-10">
          {[...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges)].map((badge, i) => (
            <div key={i} className="flex items-center justify-center gap-3 px-5 sm:px-6 py-3 sm:py-4 rounded-xl bg-white/5 border border-white/10 whitespace-nowrap backdrop-blur-sm">
              <span className="text-[#7D651F]"><DynamicIcon name={['ShieldCheck', 'Building2', 'Compass', 'CheckCircle'][i % 4] || 'CheckCircle'} className="w-5 h-5" /></span>
              <span className="text-xs sm:text-sm font-semibold text-white">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 8 — CUSTOMER REVIEWS ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-[#f8f9fb]" id="reviews">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#7D651F]/5 rounded-full blur-[100px]" />
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">Testimonials</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              What Our <span className="text-gradient">Buyers Say</span>
            </h2>
          </div>

          <ReviewsSection reviews={data.reviews || fallback.reviews} />
        </div>
      </section>

      {/* ===== SECTION 9 — YOUTUBE VIDEOS ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-white overflow-hidden" id="videos">
        <div className="w-full relative z-10">
          <div className="text-center mb-12 sm:mb-16 px-4">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">Watch & Explore</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              See It <span className="text-gradient">for Yourself</span>
            </h2>
            <p className="text-base sm:text-lg text-[#5a6a82] max-w-2xl mx-auto leading-relaxed">
              Take a virtual tour of our projects, watch development updates, and hear directly from our happy buyers.
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <YouTubeCarousel videos={data.youtubeVideos || fallback.youtubeVideos} />
          </div>
        </div>
      </section>

      {/* ===== SECTION 10 — FAQ ===== */}
      <section className="py-16 sm:py-20 lg:py-24 relative bg-[#f8f9fb]" id="faq">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <p className="text-xs sm:text-sm font-semibold text-[#7D651F] mb-3 tracking-wider uppercase luxury-subheading">FAQ</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#002935] luxury-heading">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
          </div>

          <FaqAccordion items={data.faqItems || fallback.faqItems} />
        </div>
      </section>
    </>
  )
}

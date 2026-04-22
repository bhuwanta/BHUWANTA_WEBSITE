import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Phone, MessageCircle, ChevronDown } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, homeQuery } from '@/lib/sanity'
import { FaqAccordion } from './FaqAccordion'
import { ProjectRegistrationForm } from './ProjectRegistrationForm'
import { BrochureRegistrationForm } from './BrochureRegistrationForm'
import { DynamicIcon } from '@/components/ui/DynamicIcon'

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
  trustBadges: [
    { label: 'HMDA Approved' },
    { label: 'Registered Company' },
    { label: 'Vastu-Certified Layouts' },
    { label: 'Zero Hidden Charges' },
  ],
  whyOwnLandHeading: 'The Smartest Asset You\'ll Ever Own',
  whyOwnLandSubheading: 'Land doesn\'t depreciate. It doesn\'t flood with maintenance bills. It waits for you — and grows while it waits.',
  whyOwnLandCards: [
    { icon: 'TrendingUp', title: 'Appreciates Over Time', description: 'Land in Hyderabad\'s growth corridors has consistently outpaced fixed deposits, gold, and most equity investments. Buy early. Benefit for decades.' },
    { icon: 'Home', title: 'Build When You\'re Ready', description: 'No EMI pressure on construction. Purchase your plot today and build your dream home on your own timeline — 1 year or 10.' },
    { icon: 'Globe', title: 'Secure Your Roots', description: 'Own verified, HMDA-approved land back home. No maintenance headaches from abroad. Your asset stays safe, your title stays clear.' },
    { icon: 'Key', title: '100% Yours — Forever', description: 'Unlike apartments, your land has no society fees, no builder disputes, no depreciation. It is simply, entirely yours.' },
  ],
  featuredProjectName: '[PROJECT NAME]',
  featuredProjectLocation: '[LOCATION], Hyderabad',
  featuredProjectDescription: 'Bhuwanta\'s debut development — a carefully planned, Vastu-aligned layout in one of Hyderabad\'s fastest-growing zones. Every plot is HMDA-approved, clearly titled, and ready for construction.',
  featuredProjectDetails: [
    { icon: 'MapPin', label: 'Location', value: '[AREA], Hyderabad' },
    { icon: 'Ruler', label: 'Plot Sizes', value: '150 sq yd – 300 sq yd' },
    { icon: 'IndianRupee', label: 'Price', value: 'Starting ₹[PRICE] per sq yd' },
    { icon: 'Landmark', label: 'Approval', value: 'HMDA Approved | LP No. [NUMBER]' },
    { icon: 'CheckCircle', label: 'Status', value: 'Registrations Open' },
  ],
  featuredProjectFormHeadline: 'Be among the first to own a plot.',
  vastuHeading: 'Every Plot. Vastu-Aligned. Prosperity-Ready.',
  vastuSubheading: 'Our master layout is designed in consultation with certified Vastu experts — so your home starts on the right foundation, in every sense.',
  vastuCards: [
    { icon: 'Compass', title: 'Directional Alignment', description: 'Each plot is oriented to ensure correct solar and wind flow — maximising natural light, ventilation, and positive energy.' },
    { icon: 'Home', title: 'Harmonious Living', description: 'The layout is planned so homes face auspicious directions, with wide roads and open spaces positioned for peaceful community living.' },
    { icon: 'Sun', title: 'Scientific + Spiritual', description: 'Vastu isn\'t just tradition — it aligns with principles of space efficiency, natural light, and environmental harmony. We honour both.' },
    { icon: 'Sprout', title: 'Prosperity-Driven Design', description: 'Certified by our Vastu consultant, the master plan is built to help every family that settles here thrive — not just live.' },
  ],
  faqHeading: 'Legal, Vastu & Site Visits — Your Common Questions Answered',
  faqItems: [
    { question: 'Is this project HMDA approved?', answer: 'Yes. Our project carries full HMDA approval with LP Number. We will provide copies of all approval documents before any booking is made.' },
    { question: 'What documents will I receive at the time of purchase?', answer: 'You will receive the Sale Deed, Encumbrance Certificate, Link Documents, Layout Approval Copy, and RERA Registration Certificate — all verified and transparent.' },
    { question: 'Can I visit the site before booking?', answer: 'Absolutely. We encourage every buyer to visit the site in person before making a decision. Contact us to schedule a free guided site visit at a time that suits you.' },
    { question: 'Are there any hidden charges?', answer: 'None. The price you are quoted is the price you pay. All costs — registration, stamp duty, and applicable fees — are disclosed upfront before you commit.' },
    { question: 'What payment options are available?', answer: 'We offer flexible payment plans tailored to your needs. Both full payment and structured instalment options are available. Contact us for a personalised plan.' },
    { question: 'Can I avail a home loan to purchase this plot?', answer: 'Yes. Our plots are eligible for plot purchase loans from leading banks and NBFCs. We will assist you in connecting with the right lender and completing documentation.' },
    { question: 'Is the layout Vastu-compliant?', answer: 'Yes. Our master layout has been designed in consultation with certified Vastu experts. Plot orientations, road directions, and open space placement all follow Vastu principles.' },
    { question: 'When can I start construction on my plot?', answer: 'Immediately after registration. All plots are clear-title, HMDA-approved, and construction-ready from day one. No waiting periods, no builder dependencies.' },
  ],
  finalCtaHeading: 'Ready to Own Your Land in Hyderabad?',
  finalCtaSubtext: 'Join the growing number of families and investors building their future with Bhuwanta. Take the first step — it costs nothing to visit.',
  finalCtaSupportingText: '📞 [PHONE NUMBER]  |  ✉️ info@bhuwanta.com',
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
      {/* ===== SECTION 1 — HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#BA9832]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#BA9832]/5 blur-[120px]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
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
              className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white transition-premium hover:scale-105 glow-gold"
            >
              Book a Free Site Visit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+91XXXXXXXXXX"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
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

      {/* ===== SECTION 2 — TRUST BAR ===== */}
      <section className="bg-white border-b border-[#e8ecf2] overflow-hidden py-5 sm:py-6" id="trust-bar">
        <div className="animate-marquee gap-8 px-4 flex">
          {/* Double array for infinite scrolling effect */}
          {[...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges), ...(data.trustBadges || fallback.trustBadges)].map((badge, i) => (
            <div key={i} className="flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-[#f8f9fb] border border-[#e8ecf2] whitespace-nowrap">
              <span className="text-[#BA9832]"><DynamicIcon name={['ShieldCheck', 'Building2', 'Compass', 'CheckCircle'][i % 4] || 'CheckCircle'} className="w-5 h-5" /></span>
              <span className="text-sm font-semibold text-[#002935]">{badge.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== SECTION 3 — FEATURED PROJECT TEASER ===== */}
      <section className="section-padding relative bg-[#f8f9fb] luxury-bg-grid" id="featured-project">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase luxury-subheading">Now Open</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002935] mb-2 luxury-heading">
              Our First Project — <span className="text-gradient">{data.featuredProjectName}</span>
            </h2>
            <p className="text-lg text-[#5a6a82]">
              {data.featuredProjectLocation} | Registrations Now Open
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Project Info */}
            <div className="flex flex-col justify-center">
              <p className="text-[#5a6a82] leading-relaxed mb-8 text-lg">
                {data.featuredProjectDescription}
              </p>

              <div className="space-y-4 mb-8 lg:mb-0">
                {(data.featuredProjectDetails || fallback.featuredProjectDetails).map((detail, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-4 border border-[#e8ecf2] shadow-sm hover:border-[#BA9832]/30 transition-premium">
                    <span className="text-lg shrink-0 text-[#BA9832] mt-0.5">
                      <DynamicIcon name={detail.icon} className="w-5 h-5" />
                    </span>
                    <div>
                      <span className="text-xs font-semibold text-[#5a6a82] uppercase tracking-wider">{detail.label}</span>
                      <p className="text-sm font-medium text-[#002935]">{detail.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-white rounded-2xl p-8 border border-[#e8ecf2] shadow-sm flex flex-col justify-center h-full">
              <h3 className="text-xl font-bold text-[#002935] mb-2">Register Your Interest</h3>
              <p className="text-sm text-[#5a6a82] mb-6">{data.featuredProjectFormHeadline}</p>
              <ProjectRegistrationForm />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 4 — VASTU-COMPLIANT LAYOUTS ===== */}
      <section className="section-padding relative bg-white" id="vastu">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase luxury-subheading">Vastu-Compliant</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              {data.vastuHeading}
            </h2>
            <p className="text-lg text-[#5a6a82] max-w-3xl mx-auto leading-relaxed">
              {data.vastuSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.vastuCards || fallback.vastuCards).map((card, i) => (
              <div
                key={i}
                className="h-full glass-card bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ecf2] group transition-premium hover:border-[#BA9832]/30 hover:shadow-lg flex flex-col justify-center text-center"
              >
                <span className="text-3xl mb-4 block text-[#BA9832] mx-auto">
                  <DynamicIcon name={card.icon} className="w-8 h-8" />
                </span>
                <h3 className="text-lg font-semibold text-[#002935] mb-3">{card.title}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROMOTIONAL BANNER ===== */}
      <section className="py-12 sm:py-16 relative bg-[#002935] overflow-hidden" id="promo-banner">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#BA9832]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#BA9832]/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-white/5 border border-white/10 rounded-2xl p-8 sm:p-12 backdrop-blur-sm">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block px-3 py-1 rounded-full bg-[#BA9832]/20 text-[#BA9832] text-xs font-bold tracking-wider uppercase mb-4">Limited Availability</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
                Special Pre-Launch Offers Available Now
              </h2>
              <p className="text-white/80 text-lg">
                Register early to secure premium corner plots and exclusive pricing.
              </p>
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/contact"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
              >
                Claim Offer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 5 — WHY OWN LAND ===== */}
      <section className="section-padding relative bg-[#f8f9fb] luxury-bg-topography" id="why-own-land">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase luxury-subheading">The Smart Investment</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002935] mb-4 luxury-heading">
              {data.whyOwnLandHeading}
            </h2>
            <p className="text-lg text-[#5a6a82] max-w-3xl mx-auto leading-relaxed">
              {data.whyOwnLandSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.whyOwnLandCards || fallback.whyOwnLandCards).map((card, i) => (
              <div
                key={i}
                className="h-full glass-card bg-white rounded-2xl p-6 sm:p-8 border border-[#e8ecf2] group transition-premium hover:border-[#BA9832]/30 hover:scale-[1.02] hover:shadow-lg flex flex-col justify-center text-center"
              >
                <span className="text-3xl mb-4 block text-[#BA9832] mx-auto">
                  <DynamicIcon name={card.icon} className="w-8 h-8" />
                </span>
                <h3 className="text-lg font-semibold text-[#002935] mb-3">{card.title}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 6 — FAQ ===== */}
      <section className="section-padding relative bg-white" id="faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase luxury-subheading">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#002935] luxury-heading">
              {data.faqHeading}
            </h2>
          </div>

          <FaqAccordion items={data.faqItems || fallback.faqItems} />
        </div>
      </section>

      {/* ===== SECTION 7 — REACH US ===== */}
      <section className="section-padding bg-[#f8f9fb]" id="reach-us">
        <div className="max-w-5xl mx-auto">
          
          {/* Reach Us Box */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden gradient-primary p-8 sm:p-12 flex flex-col justify-center text-center">
            <div className="absolute inset-0 noise-overlay" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Reach Us
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-sm mx-auto">
                {data.finalCtaSubtext}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                <Link
                  href="/contact"
                  id="final-cta-site-visit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
                >
                  Book a Free Site Visit
                </Link>
                <a
                  href="https://wa.me/91XXXXXXXXXX"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="final-cta-whatsapp"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Us
                </a>
              </div>

              <p className="text-sm text-white/60">
                {data.finalCtaSupportingText}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ===== SECTION 8 — DOWNLOAD BROCHURE ===== */}
      <section className="py-16 sm:py-24 relative bg-white luxury-bg-topography overflow-hidden" id="download-brochure">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#BA9832]/5 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Content */}
            <div className="text-[#002935]">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 leading-tight luxury-heading">
                Download the <br />
                <span className="text-gradient">Master Brochure</span>
              </h2>
              <p className="text-lg text-[#5a6a82] mb-10 leading-relaxed max-w-lg">
                Enter your details to instantly receive the complete project master plan, exact plot sizes, and detailed pricing guide.
              </p>
              
              <div className="space-y-5">
                {[
                  'Complete Master Plan & Layouts',
                  'Detailed Plot Availability',
                  'Clear Pricing & Payment Schedules',
                  'Vastu Compliance Details',
                  'Exact Distances to Major Landmarks'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#BA9832]/10 flex items-center justify-center border border-[#BA9832]/30">
                      <DynamicIcon name="Check" className="w-3.5 h-3.5 text-[#BA9832]" />
                    </div>
                    <span className="text-[#002935] font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Form Card */}
            <div className="bg-[#f8f9fb] border border-[#e8ecf2] rounded-2xl sm:rounded-3xl p-8 sm:p-10 shadow-lg relative">
              <h3 className="text-2xl font-bold text-[#002935] mb-2 luxury-heading">Get Your Copy</h3>
              <p className="text-[#5a6a82] mb-8 text-sm">We'll send the brochure directly to your inbox and WhatsApp.</p>
              
              <BrochureRegistrationForm />
            </div>

          </div>
        </div>
      </section>
    </>
  )
}

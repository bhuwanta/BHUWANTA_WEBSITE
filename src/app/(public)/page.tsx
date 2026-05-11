import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FileText, MapPin, Eye, Compass, Building2, Search, CalendarDays, ShieldCheck, HeartHandshake, PenTool, Award, CheckCircle2, Navigation, MessageCircle, Phone } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, homeQuery, projectsQuery, urlFor } from '@/lib/sanity'
import { ProjectRegistrationForm } from './ProjectRegistrationForm'
import { BrochureRegistrationForm } from './BrochureRegistrationForm'
import { DynamicIcon } from '@/components/ui/DynamicIcon'
import { JourneySection } from '@/components/ui/JourneySection'
import { ReviewsSection } from '@/components/ui/ReviewsSection'
import { MapSection } from '@/components/ui/MapSection'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('home', 'HMDA Approved Plots in Hyderabad', 'Own HMDA-approved, Vastu-aligned plots in Hyderabad\'s fastest-growing corridors. Designed for homebuilders and smart investors. Book a free site visit today.')
}

export const revalidate = 60

// Fallback content
const fallback = {
  heroHeading: 'Own Your Land with Confidence',
  heroSubheading: 'Premium HMDA-approved plots in Hyderabad designed for smart investment and future-ready living.',
  heroTagline: 'Land Today. Landmark Tomorrow.',
  heroPrimaryCta: 'Book Free Site Visit',
  heroSecondaryCta: 'Call Now',

  whyChooseHeading: 'Why Choose BHUWANTA?',
  whyChooseContent: 'At BHUWANTA, we go beyond selling plots we deliver trust, transparency, and long-term value. Our developments are carefully planned to ensure secure investments and future growth.',
  whyChoosePoints: [
    { icon: 'Award', title: 'HMDA & DTCP Approved Projects', description: 'Every plot is fully approved and legally verified.' },
    { icon: 'FileText', title: 'Clear legal documentation', description: '100% clear titles with zero encumbrances.' },
    { icon: 'MapPin', title: 'Prime growth locations', description: 'Strategically chosen for high appreciation.' },
    { icon: 'Eye', title: 'Transparent pricing', description: 'No hidden charges. What you see is what you pay.' },
    { icon: 'Compass', title: 'Vastu-compliant planning', description: 'Designed according to strict Vastu principles.' },
    { icon: 'Building2', title: 'Ready-for-construction', description: 'Start building your dream home from day one.' },
  ],

  projectsHeading: 'Explore Our Premium Open Plot Projects',
  projectsContent: 'Discover strategically located HMDA-approved plots in Hyderabad’s fastest growing corridors. Each project is designed to offer excellent connectivity, infrastructure, and long-term appreciation.',
  projectsCta: 'View All Projects',

  journeyHeading: 'Your Journey to Owning a Plot with BHUWANTA',
  journeySteps: [
    { icon: 'Search', title: '1. Explore Projects', description: 'Browse our available plots and choose your preferred location.' },
    { icon: 'CalendarDays', title: '2. Schedule a Site Visit', description: 'Visit the site and experience the layout and surroundings.' },
    { icon: 'ShieldCheck', title: '3. Verify Documents', description: 'Review all legal approvals and documentation with full transparency.' },
    { icon: 'HeartHandshake', title: '4. Book Your Plot', description: 'Select your plot and proceed with booking.' },
    { icon: 'PenTool', title: '5. Registration & Ownership', description: 'Complete registration and become a proud land owner.' },
  ],

  reviewsHeading: 'What Our Customers Say',
  reviewsContent: 'Our customers trust us for delivering legally secure, well-planned, and value driven land investments.',
  reviews: [
    { name: 'Ramesh G.', role: 'Investor', rating: 5, content: 'Very professional team. They showed all the HMDA documents clearly. The plot location is excellent for investment.' },
    { name: 'Srinivas R.', role: 'Homebuilder', rating: 5, content: 'Booked a plot for my future home. The layout development is already complete and ready for construction.' },
    { name: 'Kavita M.', role: 'IT Professional', rating: 5, content: 'Transparent pricing with no hidden charges. The entire registration process was smooth and hassle-free.' },
  ],

  brochureHeading: 'Download Project Brochure',
  brochureContent: 'Get complete details about our projects, including layout plans, pricing, amenities, and location insights.',

  mapHeading: 'Project Locations & Connectivity',
  mapContent: 'Explore the exact locations of our projects with easy access to highways, schools, hospitals, and key infrastructure.',
  mapFeatures: [
    { icon: 'building', title: 'Major IT Hubs', distance: '15 Minutes Drive' },
    { icon: 'navigation', title: 'Highway Access', distance: 'Direct Connectivity' },
    { icon: 'map-pin', title: 'Schools & Hospitals', distance: 'Within 5km Radius' },
  ],
  mapLocationDescription: 'Explore our meticulously planned layout situated in the heart of Hyderabad\'s fastest-growing real estate corridor.',

  certificationsHeading: 'Our Certifications & Approvals',
  certificationsContent: 'We ensure every project meets the highest standards of legality and compliance.',
  certifications: [
    { label: 'HMDA Approved', icon: 'Award' },
    { label: 'RERA Certified', icon: 'ShieldCheck' },
    { label: 'Clear Title', icon: 'FileText' },
    { label: 'Verified Documentation', icon: 'CheckCircle2' },
  ],

  enquiryHeading: 'Book Your Free Site Visit Today',
  enquiryContent: 'Interested in owning a plot? Fill in your details and our team will assist you with site visits, pricing, and documentation.',

  finalCtaHeading: 'Start Your Land Investment Journey Today',
  finalCtaContent: 'Secure your future with a trusted land investment. Book a site visit and explore the best plots in Hyderabad.',
}

export default async function HomePage() {
  let data = fallback
  let projects: any[] = []
  try {
    const sanityData = await sanityFetch<typeof fallback>({ query: homeQuery, tags: ['home'] })
    if (sanityData) data = { ...fallback, ...sanityData }

    const projectsData = await sanityFetch<{ projectEntries?: any[] }>({ query: projectsQuery, tags: ['projects'] })
    if (projectsData?.projectEntries) {
      projects = projectsData.projectEntries
    }
  } catch (error) {
    console.error("Error fetching sanity data on home page:", error)
  }

  return (
    <>
      {/* ===== SECTION 1 — HERO BANNER ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        <Image
          src="/img-4.jpg"
          alt="Bhuwanta Background"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f1d33]/70 via-[#1e3a5f]/30 to-[#1e3a5f]/80" />
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#c4a55a]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#c4a55a]/10 blur-[120px]" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 text-center mt-20">
          <p className="text-[#c4a55a] font-bold tracking-widest uppercase text-sm mb-6 animate-fade-in-up drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {data.heroTagline}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 sm:mb-8 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
            {data.heroHeading}
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
            {data.heroSubheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              id="hero-cta-primary"
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white transition-premium hover:scale-105 shadow-lg shadow-[#c4a55a]/20"
            >
              {data.heroPrimaryCta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="tel:+919666504405"
              id="hero-cta-secondary"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-premium shadow-lg"
            >
              <Phone className="w-4 h-4" />
              {data.heroSecondaryCta}
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

      {/* ===== SECTION 2 — WHY CHOOSE BHUWANTA ===== */}
      <section className="py-24 bg-white relative overflow-hidden" id="why-choose-us">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-4">
              {data.whyChooseHeading}
            </h2>
            <p className="text-lg text-[#5a6a82] leading-relaxed">
              {data.whyChooseContent}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {data.whyChoosePoints.map((point, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl bg-[#f7f8fa] border border-[#e8ecf2] transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-[#0f1d33]/5 hover:border-[#c4a55a]/30"
              >
                <div className="w-12 h-12 rounded-xl bg-[#c4a55a]/10 flex items-center justify-center mb-6 group-hover:bg-[#c4a55a] transition-colors duration-500">
                  <DynamicIcon name={point.icon} className="w-6 h-6 text-[#c4a55a] group-hover:text-white transition-colors duration-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0f1d33] mb-3">{point.title}</h3>
                {point.description && (
                  <p className="text-[#5a6a82] leading-relaxed text-sm">
                    {point.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 3 — OUR PROJECTS ===== */}
      <section className="py-24 bg-[#f7f8fa]" id="projects">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-4">
                {data.projectsHeading}
              </h2>
              <p className="text-lg text-[#5a6a82]">
                {data.projectsContent}
              </p>
            </div>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-semibold text-[#1e3a5f] hover:text-[#c4a55a] transition-colors"
            >
              {data.projectsCta} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Simple Mockup Grid for Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? projects.map((project, idx) => (
              <Link href={`/projects/${project.slug?.current || '#'}`} key={idx} className="group block bg-white rounded-2xl overflow-hidden border border-[#e8ecf2] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-[#e8ecf2] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">{project.statusText === 'registrations-open' ? 'Registrations Open' : 'HMDA Approved'}</span>
                  </div>
                  {project.image?.asset && (
                    <Image
                      src={urlFor(project.image).url()}
                      alt={project.name || 'Project Image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  )}
                  {!project.image?.asset && (
                    <div className="absolute inset-0 bg-[#0f1d33]/5 group-hover:scale-105 transition-transform duration-700" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0f1d33] mb-2 group-hover:text-[#1e3a5f] transition-colors">{project.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#5a6a82] mb-4">
                    <MapPin className="w-4 h-4" /> {project.location || 'Hyderabad'}
                  </div>
                  <div className="pt-4 border-t border-[#e8ecf2] flex items-center justify-between text-sm font-semibold text-[#1e3a5f]">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            )) : [1, 2, 3].map((item) => (
              <Link href="/projects" key={item} className="group block bg-white rounded-2xl overflow-hidden border border-[#e8ecf2] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="aspect-[4/3] bg-[#e8ecf2] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                  <div className="absolute bottom-4 left-4 z-20">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">HMDA Approved</span>
                  </div>
                  {/* Placeholder for project image */}
                  <div className="absolute inset-0 bg-[#0f1d33]/5 group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#0f1d33] mb-2 group-hover:text-[#1e3a5f] transition-colors">Premium Layout Phase {item}</h3>
                  <div className="flex items-center gap-2 text-sm text-[#5a6a82] mb-4">
                    <MapPin className="w-4 h-4" /> Hyderabad West Corridor
                  </div>
                  <div className="pt-4 border-t border-[#e8ecf2] flex items-center justify-between text-sm font-semibold text-[#1e3a5f]">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 4 — YOUR JOURNEY ===== */}
      <section className="py-24 bg-white" id="journey">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-4">
              {data.journeyHeading}
            </h2>
          </div>

          <JourneySection steps={data.journeySteps} />
        </div>
      </section>

      {/* ===== SECTION 5 — CUSTOMER REVIEWS ===== */}
      <section className="py-24 bg-[#0f1d33] relative overflow-hidden" id="reviews">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a55a]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#1e3a5f]/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {data.reviewsHeading}
            </h2>
            <p className="text-lg text-white/70">
              {data.reviewsContent}
            </p>
          </div>

          <ReviewsSection reviews={data.reviews} />
        </div>
      </section>

      {/* ===== SECTION 6 — BROCHURE DOWNLOAD ===== */}
      <section className="py-24 bg-white" id="brochure">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#f7f8fa] rounded-3xl p-8 lg:p-12 border border-[#e8ecf2] shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] font-semibold text-sm mb-6">
                  <FileText className="w-4 h-4" /> E-Brochure Available
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-6">
                  {data.brochureHeading}
                </h2>
                <p className="text-lg text-[#5a6a82] mb-8 leading-relaxed">
                  {data.brochureContent}
                </p>

                <ul className="space-y-4 mb-8">
                  {['Detailed Master Plan & Layout', 'Exact Pricing & Payment Plans', 'Location Map & Connectivity', 'Project Amenities Overview'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[#0f1d33] font-medium">
                      <CheckCircle2 className="w-5 h-5 text-[#c4a55a]" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#e8ecf2]">
                <BrochureRegistrationForm projects={projects} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECTION 7 — MAP & CONNECTIVITY ===== */}
      <section className="py-24 bg-[#f7f8fa]" id="location">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-4">
              {data.mapHeading}
            </h2>
            <p className="text-lg text-[#5a6a82]">
              {data.mapContent}
            </p>
          </div>

          <MapSection features={data.mapFeatures} location={data.mapLocationDescription} />
        </div>
      </section>

      {/* ===== SECTION 8 — CERTIFICATIONS ===== */}
      <section className="py-16 bg-white border-y border-[#e8ecf2]" id="certifications">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#0f1d33] mb-2">{data.certificationsHeading}</h2>
          <p className="text-[#5a6a82] mb-10">{data.certificationsContent}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.certifications.map((cert, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#f7f8fa] border border-[#e8ecf2] hover:shadow-md transition-all">
                <DynamicIcon name={cert.icon} className="w-10 h-10 text-[#c4a55a] mb-4" />
                <h4 className="font-bold text-[#0f1d33] text-center">{cert.label}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 9 — ENQUIRY FORM ===== */}
      <section className="py-24 bg-[#f7f8fa]" id="enquiry">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl shadow-[#0f1d33]/5 border border-[#e8ecf2]">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[#0f1d33] mb-4">
                {data.enquiryHeading}
              </h2>
              <p className="text-[#5a6a82]">
                {data.enquiryContent}
              </p>
            </div>

            <ProjectRegistrationForm />
          </div>
        </div>
      </section>

      {/* ===== SECTION 10 — FINAL CTA ===== */}
      <section className="py-24 relative overflow-hidden bg-[#0f1d33]" id="final-cta">
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1220] to-transparent" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {data.finalCtaHeading}
          </h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto">
            {data.finalCtaContent}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl gradient-gold text-white transition-premium hover:scale-105 shadow-lg shadow-[#c4a55a]/20"
            >
              Book Site Visit
            </Link>
            <a
              href="tel:+919666504405"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold rounded-xl bg-white text-[#0f1d33] hover:bg-[#f7f8fa] transition-premium shadow-lg"
            >
              Call Now
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

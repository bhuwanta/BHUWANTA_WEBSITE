import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building, Star, Shield, MapPin } from 'lucide-react'
import { generatePageMetadata } from '@/lib/seo'
import { sanityFetch, homeQuery } from '@/lib/sanity'

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata('home', 'Premium Real Estate')
}

export const revalidate = 60

// Fallback content when Sanity isn't configured
const fallback = {
  heroHeading: 'Redefining Luxury Living',
  heroSubheading: 'Discover exceptional properties crafted with precision, designed for those who demand the extraordinary in every detail of their home.',
  heroCta: 'Explore Projects',
  featuredSectionHeading: 'Featured Projects',
  aboutTeaser: 'With decades of experience in premium real estate, Bhuwanta delivers unparalleled quality and design that transforms spaces into extraordinary living experiences.',
  ctaBannerHeading: 'Ready to Find Your Dream Property?',
  ctaBannerSubtext: 'Our expert team is here to guide you through every step of your journey.',
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
      {/* Hero Section — Navy background for dramatic contrast */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden" id="hero">
        {/* Background */}
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 noise-overlay" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-[#BA9832]/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-[#BA9832]/5 blur-[120px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] mb-6 sm:mb-8">
            <span className="text-white">Redefining</span>
            <br />
            <span className="text-gradient">Luxury Living</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            {data.heroSubheading}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects"
              id="hero-cta-primary"
              className="group inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white transition-premium hover:scale-105 glow-gold"
            >
              {data.heroCta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/contact"
              id="hero-cta-secondary"
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl border border-white/20 text-white hover:bg-white/10 transition-premium"
            >
              Book Site Visit
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
            {[
              { value: '15+', label: 'Years Experience' },
              { value: '200+', label: 'Projects Delivered' },
              { value: '5000+', label: 'Happy Families' },
              { value: '10M+', label: 'Sq. Ft. Developed' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 sm:p-5 transition-premium bg-white/5 border border-white/10 hover:border-[#BA9832]/30">
                <p className="text-xl sm:text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-5 h-8 rounded-full border-2 border-white/60 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/80" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-white/60 font-medium">Scroll</span>
        </div>
      </section>

      {/* Features Section — White background */}
      <section className="section-padding relative bg-white" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase">Why Choose Us</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002935]">
              {data.featuredSectionHeading || 'Excellence in Every Detail'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Building,
                title: 'Premium Construction',
                desc: 'Every project is built with the finest materials and cutting-edge construction techniques for lasting quality.',
              },
              {
                icon: Shield,
                title: 'Trusted Expertise',
                desc: 'Our experienced team ensures transparency, reliability, and excellence at every stage of your property journey.',
              },
              {
                icon: MapPin,
                title: 'Prime Locations',
                desc: 'Strategically located properties that offer the best connectivity, amenities, and lifestyle conveniences.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card rounded-2xl p-8 group transition-premium hover:border-[#BA9832]/30 hover:scale-[1.02] hover:shadow-lg"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-premium">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#002935] mb-3">{feature.title}</h3>
                <p className="text-sm text-[#5a6a82] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Teaser — Soft gray background */}
      <section className="section-padding relative overflow-hidden bg-[#f8f9fb]" id="about-teaser">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#003d4f]/3 blur-[150px]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-[#BA9832] mb-3 tracking-wider uppercase">About Bhuwanta</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#002935] mb-6">
                Building Dreams,<br />
                <span className="text-gradient">Creating Legacies</span>
              </h2>
              <p className="text-[#5a6a82] leading-relaxed mb-8">
                {data.aboutTeaser}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#003d4f] hover:text-[#BA9832] transition-premium animated-underline"
              >
                Learn More About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-[#e8ecf2]">
                <div className="w-full h-full gradient-primary opacity-10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Building className="w-16 h-16 text-[#003d4f]/20 mx-auto mb-4" />
                    <p className="text-sm text-[#5a6a82]/50">Company Image</p>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 right-2 sm:-right-4 bg-white rounded-xl p-3 sm:p-4 shadow-lg border border-[#e8ecf2]">
                <p className="text-2xl font-bold text-gradient">15+</p>
                <p className="text-xs text-[#5a6a82]">Years of Trust</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner — Navy background */}
      <section className="section-padding bg-white" id="cta-banner">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden gradient-primary p-6 sm:p-12 md:p-16 text-center">
            <div className="absolute inset-0 noise-overlay" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                {data.ctaBannerHeading}
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                {data.ctaBannerSubtext}
              </p>
              <Link
                href="/contact"
                id="cta-banner-button"
                className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold rounded-xl gradient-gold text-white hover:scale-105 transition-premium glow-gold"
              >
                Schedule a Consultation
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { client, urlFor } from '@/lib/sanity'
import logoFallback from '@/images/logo.png'

const defaultNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

interface SiteSettings {
  siteName?: string
  tagline?: string
  logo?: any
  navLinks?: { label: string; href: string }[]
  ctaButtonText?: string
  ctaButtonLink?: string
}

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>({})

  const isHome = pathname === '/'
  const showGlass = scrolled || !isHome

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    client.fetch(`*[_type == "siteSettings"][0]{
      siteName, tagline, logo, navLinks[]{ label, href }, ctaButtonText, ctaButtonLink
    }`).then((data: SiteSettings) => {
      if (data) setSettings(data)
    }).catch(() => {})
  }, [])

  const navLinks = settings.navLinks?.length ? settings.navLinks : defaultNavLinks
  const siteName = settings.siteName || 'BHUWANTA'
  const tagline = settings.tagline || 'Land Today. Landmark Tomorrow.'
  const ctaText = settings.ctaButtonText || 'Book Site Visit'
  const ctaLink = settings.ctaButtonLink || '/contact'
  const logoSrc = settings.logo ? urlFor(settings.logo).height(80).url() : null

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        showGlass
          ? 'bg-white/80 backdrop-blur-xl border-b border-[#e8ecf2] shadow-sm py-4'
          : 'bg-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center" id="nav-logo">
            <div className="relative h-12 sm:h-16 w-auto transition-transform duration-500 hover:scale-[1.05] origin-left">
              <Image 
                src={logoSrc || logoFallback} 
                alt={siteName} 
                height={64}
                width={logoSrc ? 180 : undefined}
                className={cn(
                  "h-12 sm:h-16 w-auto object-contain transition-all duration-500",
                  !showGlass && "drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]",
                  showGlass && "brightness-0"
                )}
                priority
              />
            </div>
          </Link>

          {/* Right Section: Nav + CTA */}
          <div className="flex items-center gap-8">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={cn(
                    "px-4 py-2 text-sm transition-premium rounded-lg",
                    showGlass 
                      ? "text-[#002935] font-bold hover:text-[#7D651F] hover:bg-[#f3f5f8]" 
                      : "text-white/80 font-medium hover:text-white hover:bg-white/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + Call Now + Mobile Toggle */}
            <div className="flex items-center gap-3">
              <a
                href="tel:+91XXXXXXXXXX"
                id="nav-call"
                className={cn(
                  "hidden lg:inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-premium",
                  showGlass
                    ? "bg-black text-white hover:bg-black/80"
                    : "bg-white text-black hover:bg-white/90"
                )}
              >
                Call Now
              </a>
              <Link
                href={ctaLink}
                id="nav-cta"
                className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold rounded-lg transition-premium hover:scale-105 glow-gold gradient-gold text-white"
              >
                {ctaText}
              </Link>

              {/* Mobile hamburger */}
              <button
                className={cn(
                  "md:hidden p-2 transition-colors",
                  showGlass ? "text-[#002935]" : "text-white"
                )}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
                id="nav-mobile-toggle"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-500',
          isOpen ? 'max-h-[400px] border-t border-[#e8ecf2] bg-white' : 'max-h-0'
        )}
      >
        <div className="px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm font-medium text-[#5a6a82] hover:text-[#002935] hover:bg-[#f3f5f8] rounded-lg transition-premium"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={ctaLink}
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-center rounded-lg gradient-gold text-white mt-3"
          >
            {ctaText}
          </Link>
        </div>
      </div>
    </nav>
  )
}
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/blog', label: 'Blog' },
  { href: '/careers', label: 'Careers' },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-[#e8ecf2] shadow-sm'
          : 'bg-white'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group" id="nav-logo">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center transition-premium group-hover:scale-110 glow-gold">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#002935]">
              BHUWANTA
            </span>
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
                  className="px-4 py-2 text-sm font-medium text-[#5a6a82] hover:text-[#002935] animated-underline transition-premium rounded-lg hover:bg-[#f3f5f8]"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + Mobile Toggle */}
            <div className="flex items-center gap-4">
              <Link
                href="/contact"
                id="nav-cta"
                className="hidden sm:inline-flex px-5 py-2.5 text-sm font-semibold rounded-lg gradient-gold text-white transition-premium hover:scale-105 glow-gold"
              >
                Get in Touch
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-[#002935]"
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
          'md:hidden overflow-hidden transition-all duration-500 bg-white',
          isOpen ? 'max-h-[400px] border-t border-[#e8ecf2]' : 'max-h-0'
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
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-center rounded-lg gradient-gold text-white mt-3"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </nav>
  )
}

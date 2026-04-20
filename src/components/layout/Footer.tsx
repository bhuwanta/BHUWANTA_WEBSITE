import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin } from 'lucide-react'
import logo from '@/images/logo.png'

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
)

const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
)

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
)

const YoutubeIcon = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a1.9 1.9 0 0 0 1.32 1.35c1.7.47 8.22.47 8.22.47s6.52 0 8.22-.47a1.9 1.9 0 0 0 1.32-1.35c.46-1.69.46-5.58.46-5.58s0-3.89-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
  </svg>
)

const footerLinks = [
  { href: '/about', label: 'About Us' },
  { href: '/projects', label: 'Projects' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/careers', label: 'Careers' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="relative bg-[#002935] border-t border-white/10 pt-2">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#BA9832]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <div className="mb-8 sm:mb-10 flex flex-col items-start">
              <Link href="/" className="flex items-center group gap-3 sm:gap-4 mb-2">
                <div className="relative h-12 w-auto transition-transform duration-500 scale-[1.3] sm:scale-[1.5] origin-left group-hover:scale-[1.35] sm:group-hover:scale-[1.55]">
                  <Image 
                    src={logo} 
                    alt="Bhuwanta" 
                    height={48}
                    className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  />
                </div>
                <span className="text-xl font-bold tracking-[0.2em] text-[#BA9832] pl-2 sm:pl-4 transition-colors duration-500">
                  BHUWANTA
                </span>
              </Link>
              <p className="text-[11px] sm:text-xs font-medium tracking-[0.15em] text-[#BA9832] uppercase pl-1 sm:pl-2">
                Land Today. Landmark Tomorrow.
              </p>
            </div>
            <div className="mb-6 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#BA9832] mt-0.5 shrink-0" />
                <div className="text-sm text-white/70 leading-relaxed pr-2">
                  <strong className="block text-white mb-1 text-base tracking-wide">Headquarters</strong>
                  <p>Floor #4, Flat No. #406, Alluri Trade Center, Near KPHB Metro (Pillar #761), Hyderabad, Telangana - 500072</p>
                </div>
              </div>
              <a 
                href="https://maps.app.goo.gl/USjC2iYeGiXbZ5U16" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-fit ml-8 px-4 py-2.5 text-xs font-bold rounded-lg bg-[#BA9832]/10 text-[#BA9832] hover:bg-[#BA9832] hover:text-white transition-premium border border-[#BA9832]/20 shadow-none flex items-center gap-2 uppercase tracking-wider"
              >
                <MapPin className="w-3.5 h-3.5" />
                Open in Google Maps
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:justify-self-center">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-premium animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 lg:justify-self-center">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 group">
                <Phone className="w-4 h-4 text-[#BA9832] shrink-0" />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-3 group">
                <Mail className="w-4 h-4 text-[#BA9832] shrink-0" />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">info@bhuwanta.com</span>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div className="lg:col-span-2 lg:justify-self-end">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Follow Us
            </h3>
            <div className="flex flex-col gap-3">
              {[
                { name: 'LinkedIn', icon: LinkedinIcon },
                { name: 'Facebook', icon: FacebookIcon },
                { name: 'Instagram', icon: InstagramIcon },
                { name: 'YouTube', icon: YoutubeIcon },
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#BA9832] group transition-premium"
                  aria-label={social.name}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#BA9832]/30 group-hover:bg-[#BA9832]/10 transition-premium">
                    <social.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Bhuwanta. All rights reserved.
          </p>
          <div className="flex gap-6 pr-4 md:pr-24 lg:pr-28 pb-20 md:pb-0">
            <Link href="/policies" className="text-xs text-white/50 hover:text-white transition-premium">
              Terms & Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

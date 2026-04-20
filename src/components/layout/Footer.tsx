import Link from 'next/link'
import { Building2, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  company: [
    { href: '/about', label: 'About Us' },
    { href: '/projects', label: 'Projects' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/careers', label: 'Careers' },
  ],
  resources: [
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ],
}

export function Footer() {
  return (
    <footer className="relative bg-white border-t border-[#e8ecf2]">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#BA9832]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#002935]">
                BHUWANTA
              </span>
            </Link>
            <p className="text-sm text-[#5a6a82] leading-relaxed mb-6">
              Premium real estate solutions delivering exceptional properties and
              unparalleled living experiences.
            </p>
            <div className="flex gap-4">
              {['linkedin', 'facebook', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-[#f3f5f8] border border-[#e8ecf2] flex items-center justify-center text-[#5a6a82] hover:text-[#002935] hover:border-[#BA9832]/50 hover:bg-[#BA9832]/5 transition-premium"
                  aria-label={social}
                >
                  <span className="text-xs font-bold uppercase">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#002935] mb-4 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#5a6a82] hover:text-[#002935] transition-premium animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-[#002935] mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#5a6a82] hover:text-[#002935] transition-premium animated-underline inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-[#002935] mb-4 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#BA9832] mt-0.5 shrink-0" />
                <span className="text-sm text-[#5a6a82]">
                  Bhuwanta Office,<br />Your City, State
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#BA9832] shrink-0" />
                <span className="text-sm text-[#5a6a82]">+91 XXXXX XXXXX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#BA9832] shrink-0" />
                <span className="text-sm text-[#5a6a82]">info@bhuwanta.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#e8ecf2] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#5a6a82]">
            © {new Date().getFullYear()} Bhuwanta. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#5a6a82] hover:text-[#002935] transition-premium">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-[#5a6a82] hover:text-[#002935] transition-premium">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

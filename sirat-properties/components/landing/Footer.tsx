import Link from 'next/link'
import { MapPin, Mail, Phone } from 'lucide-react'

const LINKS = {
  Product: [
    { label: 'Browse Properties', href: '/properties' },
    { label: 'List Property', href: '/auth/login' },
    { label: 'For Agents', href: '/auth/login' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Features', href: '#features' },
  ],
  Company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'GDPR', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0A0A0F] border-t border-[#C9A96E]/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#9A7A4A] flex items-center justify-center">
                <span className="text-[#0A0A0F] font-bold text-sm font-ui">স</span>
              </div>
              <span className="font-display text-[#F0EDE8] text-xl font-semibold tracking-tight">
                সিরাত<span className="text-[#C9A96E]">প্রপার্টিজ</span>
              </span>
            </Link>
            <p className="font-ui text-[#5C5866] text-sm leading-relaxed mb-6 max-w-xs">
              Bangladesh&apos;s most trusted real estate platform. Find, list, and manage properties with confidence.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 font-ui text-xs text-[#5C5866]">
                <MapPin size={13} className="text-[#C9A96E]" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
              <div className="flex items-center gap-2 font-ui text-xs text-[#5C5866]">
                <Mail size={13} className="text-[#C9A96E]" />
                <span>hello@siratproperties.com</span>
              </div>
              <div className="flex items-center gap-2 font-ui text-xs text-[#5C5866]">
                <Phone size={13} className="text-[#C9A96E]" />
                <span>+880 1xxx-xxxxxx</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <p className="font-ui text-xs font-semibold tracking-[0.15em] uppercase text-[#C9A96E] mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="font-ui text-sm text-[#5C5866] hover:text-[#9E9AA0] transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[#1E1E2E] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-ui text-xs text-[#5C5866]">
            © 2026 সিরাত প্রপার্টিজ। All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Social icons */}
            {['FB', 'TW', 'IN', 'YT'].map((s) => (
              <button
                key={s}
                className="w-8 h-8 rounded-full border border-[#1E1E2E] flex items-center justify-center font-ui text-xs text-[#5C5866] hover:border-[#C9A96E]/30 hover:text-[#C9A96E] transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="font-ui text-xs text-[#5C5866] hover:text-[#9E9AA0] transition-colors">English</button>
            <span className="text-[#1E1E2E]">|</span>
            <button className="font-ui text-xs text-[#9E9AA0] hover:text-[#C9A96E] transition-colors">বাংলা</button>
          </div>
        </div>
      </div>
    </footer>
  )
}

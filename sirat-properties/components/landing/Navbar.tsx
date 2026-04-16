'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_LINKS = [
  { label: 'Properties', href: '/properties' },
  { label: 'Agents', href: '/agents' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
]

function getDashboardHref(role: string | null) {
  if (role === 'seller') return '/seller/dashboard'
  if (role === 'agent') return '/agent/dashboard'
  if (role === 'admin') return '/admin/dashboard'
  return '/buyer/dashboard'
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dashboardHref, setDashboardHref] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser()
      .then(async ({ data: { user } }: any) => {
        if (!user) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        setDashboardHref(getDashboardHref(profile?.role ?? null))
      })
      .catch(() => {
        // Supabase unreachable — ignore silently
      })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#0A0A0F]/85 backdrop-blur-xl border-b border-[#1E1E2E]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C9A96E] to-[#9A7A4A] flex items-center justify-center">
              <span className="text-[#0A0A0F] font-bold text-sm font-ui">স</span>
            </div>
            <span className="font-display text-[#F0EDE8] text-xl font-semibold tracking-tight">
              সিরাত<span className="text-[#C9A96E]">প্রপার্টিজ</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-ui font-medium text-[#9E9AA0] hover:text-[#F0EDE8] transition-colors duration-150 group tracking-wide"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#C9A96E] transition-all duration-300 ease-out group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="hidden md:flex items-center gap-3">
            {dashboardHref ? (
              <Link
                href={dashboardHref}
                className="lp-btn-primary flex items-center gap-2 text-sm font-ui font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-ui font-medium text-[#9E9AA0] hover:text-[#F0EDE8] transition-colors px-4 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login"
                  className="lp-btn-primary text-sm font-ui font-semibold tracking-wider uppercase px-5 py-2.5 rounded-full"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#9E9AA0] hover:text-[#F0EDE8] transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#111118] border-l border-[#1E1E2E] z-50 md:hidden flex flex-col p-6"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-display text-[#F0EDE8] text-lg font-semibold">Menu</span>
                <button onClick={() => setMenuOpen(false)} className="text-[#9E9AA0]">
                  <X size={22} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-[#9E9AA0] hover:text-[#F0EDE8] font-ui font-medium py-3 px-3 rounded-xl hover:bg-[#16161F] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-3">
                <Link
                  href="/auth/login"
                  className="text-center py-3 border border-[#2D2D45] rounded-full text-[#9E9AA0] font-ui font-medium hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth/login"
                  className="lp-btn-primary text-center py-3 rounded-full font-ui font-semibold tracking-wider uppercase text-sm"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

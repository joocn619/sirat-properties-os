'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, MapPin, Home, Banknote, ChevronDown, Star, TrendingUp, Users } from 'lucide-react'
import { staggerContainer, wordReveal, fadeUp, scaleIn, viewportOptions } from '@/lib/animations'

const HEADLINE_LINE1 = ['Find', 'Your', 'Next']
const HEADLINE_LINE2 = ['Premium', 'Property']

const STATS = [
  { icon: Home, value: '12,400+', label: 'Active Listings' },
  { icon: Star, value: '98%', label: 'Client Satisfaction' },
  { icon: TrendingUp, value: '৳850Cr+', label: 'Deals Closed' },
]

const FLOATING_CARD = {
  title: 'Bashundhara Residence',
  location: 'ঢাকা, বসুন্ধরা',
  price: '৳1.2 Cr',
  beds: 3, baths: 2, area: '1450 sqft',
  tag: 'Featured',
}

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    heroRef.current.style.setProperty('--mouse-x', `${x}%`)
    heroRef.current.style.setProperty('--mouse-y', `${y}%`)
  }

  return (
    <section
      ref={heroRef}
      onMouseMove={onMouseMove}
      className="lp-hero-spotlight relative min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center overflow-hidden pt-16"
    >
      {/* Aurora orbs */}
      <div className="lp-aurora-orb-1 top-[-10%] left-[-5%]" />
      <div className="lp-aurora-orb-2 bottom-[10%] right-[-5%]" />
      <div
        className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full opacity-5"
        style={{
          background: 'radial-gradient(ellipse, #10B981 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'aurora-shift 12s ease-in-out 5s infinite alternate',
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#C9A96E 1px, transparent 1px), linear-gradient(90deg, #C9A96E 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-center">
          {/* Left: content */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full border border-[#C9A96E]/20 bg-[#C9A96E]/5 text-[#C9A96E] text-xs font-ui font-semibold tracking-widest uppercase"
            >
              <span className="text-base">✦</span>
              Bangladesh&apos;s #1 Real Estate Platform
            </motion.div>

            {/* Headline word-by-word reveal */}
            <motion.h1
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="font-display text-[clamp(3rem,7vw,5rem)] font-light leading-[1.05] tracking-[-0.02em] text-[#F0EDE8] mb-6"
              style={{ transitionDelay: '0.4s' }}
            >
              <span className="block">
                {HEADLINE_LINE1.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordReveal}
                    className="inline-block mr-[0.25em]"
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block">
                {HEADLINE_LINE2.map((word, i) => (
                  <motion.span
                    key={i}
                    variants={wordReveal}
                    className={`inline-block mr-[0.25em] ${i === 1 ? 'lp-gradient-text' : ''}`}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="font-ui text-[#9E9AA0] text-lg leading-relaxed mb-8 max-w-lg"
            >
              The smartest real estate platform for Bangladesh.
              Properties, agents, analytics — all in one place.
            </motion.p>

            {/* Search bar */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl mb-10"
            >
              <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#111118] border border-[#2D2D45] rounded-2xl p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl focus-within:border-[#C9A96E]/50 transition-colors duration-300">
                <div className="flex items-center gap-2 flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#1E1E2E]">
                  <MapPin size={16} className="text-[#C9A96E] shrink-0" />
                  <input
                    type="text"
                    placeholder="ঢাকা, চট্টগ্রাম..."
                    className="bg-transparent text-[#F0EDE8] text-sm font-ui placeholder:text-[#5C5866] outline-none w-full"
                  />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#1E1E2E]">
                  <Home size={16} className="text-[#9E9AA0] shrink-0" />
                  <select className="bg-transparent text-sm font-ui text-[#9E9AA0] outline-none cursor-pointer appearance-none">
                    <option value="">Property Type</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Commercial</option>
                    <option>Land</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 px-3 py-2">
                  <Banknote size={16} className="text-[#9E9AA0] shrink-0" />
                  <select className="bg-transparent text-sm font-ui text-[#9E9AA0] outline-none cursor-pointer appearance-none">
                    <option value="">Budget</option>
                    <option>৳20L – ৳50L</option>
                    <option>৳50L – ৳1Cr</option>
                    <option>৳1Cr – ৳3Cr</option>
                    <option>৳3Cr+</option>
                  </select>
                </div>
                <Link
                  href="/properties"
                  className="lp-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-ui font-semibold text-sm tracking-wide whitespace-nowrap"
                >
                  <Search size={15} />
                  Search
                </Link>
              </div>
            </motion.div>

            {/* Stat badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3"
            >
              {STATS.map(({ icon: Icon, value, label }, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#111118] border border-[#1E1E2E] hover:border-[#2D2D45] transition-colors"
                  style={{ animation: `var(--animate-float)`, animationDelay: `${i * 0.4}s` }}
                >
                  <div className="w-7 h-7 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                    <Icon size={14} className="text-[#C9A96E]" />
                  </div>
                  <div>
                    <p className="font-price text-[#F0EDE8] text-sm font-medium leading-none">{value}</p>
                    <p className="font-ui text-[#5C5866] text-xs mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
              {/* User avatars */}
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#111118] border border-[#1E1E2E]">
                <div className="flex -space-x-2">
                  {['#C9A96E', '#3B82F6', '#10B981', '#F43F5E'].map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-[#111118] flex items-center justify-center"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Users size={12} className="text-[#9E9AA0]" />
                  <span className="font-ui text-xs text-[#9E9AA0]">12k+ users</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: floating property card */}
          <motion.div
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
            style={{ animation: 'var(--animate-float)', animationDelay: '0.5s' }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-[#2D2D45] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
              {/* Simulated property image */}
              <div className="h-52 relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #1a2540 0%, #0f1a30 40%, #0a1020 100%)',
              }}>
                <div className="absolute inset-0" style={{
                  background: 'radial-gradient(ellipse at 30% 50%, rgba(201,169,110,0.2) 0%, transparent 60%)',
                }} />
                {/* Fake building silhouette */}
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-3 px-6">
                  {[40, 64, 80, 56, 32].map((h, i) => (
                    <div key={i} className="rounded-t" style={{
                      width: '28px', height: `${h}%`,
                      background: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.15)',
                    }} />
                  ))}
                </div>
                {/* Tag */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-ui font-semibold tracking-wider uppercase text-[#0A0A0F]"
                  style={{ background: 'var(--gradient-gold)' }}>
                  {FLOATING_CARD.tag}
                </div>
                {/* Live indicator */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#0A0A0F]/70 px-2.5 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-ui text-[#9E9AA0]">Live</span>
                </div>
              </div>

              {/* Card body */}
              <div className="bg-[#111118] p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-price text-[#C9A96E] text-xl font-medium">{FLOATING_CARD.price}</p>
                    <p className="font-display text-[#F0EDE8] text-base font-medium mt-0.5">{FLOATING_CARD.title}</p>
                    <p className="font-ui text-[#5C5866] text-xs mt-0.5 flex items-center gap-1">
                      <MapPin size={11} />{FLOATING_CARD.location}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center">
                    <span className="text-[#10B981] text-xs">✓</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-3 border-t border-[#1E1E2E] font-ui text-xs text-[#9E9AA0]">
                  <span>🛏 {FLOATING_CARD.beds} Bed</span>
                  <span>🚿 {FLOATING_CARD.baths} Bath</span>
                  <span>📐 {FLOATING_CARD.area}</span>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="bg-[#16161F] px-4 py-2.5 flex items-center justify-between border-t border-[#1E1E2E]">
                <p className="font-ui text-xs text-[#5C5866]">Listed 2 days ago</p>
                <Link href="/properties" className="font-ui text-xs font-semibold text-[#C9A96E] hover:text-[#E2C99A] transition-colors">
                  View Details →
                </Link>
              </div>
            </div>

            {/* Floating mini badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute -bottom-4 -left-8 bg-[#111118] border border-[#1E1E2E] rounded-xl px-3 py-2.5 shadow-xl"
              style={{ animation: 'var(--animate-float-slow)', position: 'absolute' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#3B82F6]/10 rounded-lg flex items-center justify-center">
                  <TrendingUp size={13} className="text-[#3B82F6]" />
                </div>
                <div>
                  <p className="font-ui text-xs font-semibold text-[#F0EDE8]">🔥 Trending</p>
                  <p className="font-ui text-xs text-[#5C5866]">ঢাকায় এই সপ্তাহে</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-ui text-xs text-[#5C5866] tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown size={18} className="text-[#5C5866]" />
        </motion.div>
      </motion.div>
    </section>
  )
}

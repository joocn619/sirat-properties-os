'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { staggerContainer, wordReveal, fadeUp, viewportOptions } from '@/lib/animations'

const CTA_WORDS = ['Ready', 'to', 'Find', 'Your']
const CTA_WORDS2 = ['Dream', 'Property?']

export function CTABanner() {
  return (
    <section className="relative bg-[#0D0D12] py-24 lg:py-36 overflow-hidden">
      {/* Aurora orbs */}
      <div className="absolute top-[-20%] left-[20%] w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(ellipse, #C9A96E 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-shift 12s ease-in-out infinite alternate',
        }} />
      <div className="absolute bottom-[-20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(ellipse, #3B82F6 0%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora-shift 15s ease-in-out 4s infinite alternate',
        }} />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: 'linear-gradient(#C9A96E 1px, transparent 1px), linear-gradient(90deg, #C9A96E 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        {/* Headline word reveal */}
        <motion.h2
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-light text-[#F0EDE8] leading-[1.05] tracking-tight mb-6"
        >
          <span className="block mb-1">
            {CTA_WORDS.map((word, i) => (
              <motion.span key={i} variants={wordReveal} className="inline-block mr-[0.25em]">
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block">
            {CTA_WORDS2.map((word, i) => (
              <motion.span
                key={i}
                variants={wordReveal}
                className={`inline-block mr-[0.25em] ${i === 0 ? 'lp-gradient-text' : ''}`}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="font-ui text-[#9E9AA0] text-lg mb-10 max-w-xl mx-auto leading-relaxed"
        >
          Join 12,000+ users already using সিরাত প্রপার্টিজ to find, sell, and manage properties across Bangladesh.
        </motion.p>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.div variants={fadeUp}>
            <Link
              href="/auth/login"
              className="lp-btn-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-ui font-semibold text-sm tracking-widest uppercase"
            >
              Get Started Free
              <span className="text-base">→</span>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp}>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-ui font-semibold text-sm tracking-wide border border-[#2D2D45] text-[#9E9AA0] hover:border-[#C9A96E]/40 hover:text-[#F0EDE8] transition-all duration-200"
            >
              Browse Properties
            </Link>
          </motion.div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="font-ui text-xs text-[#5C5866] mt-6"
        >
          No credit card required · Free forever plan available
        </motion.p>
      </div>
    </section>
  )
}

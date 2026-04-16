'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { staggerContainer, fadeUp, viewportOptions } from '@/lib/animations'

const PLANS = [
  {
    name: 'Starter',
    monthlyPrice: 'Free',
    yearlyPrice: 'Free',
    desc: 'Perfect for individual buyers exploring the market.',
    features: [
      'Browse unlimited properties',
      '5 saved searches',
      'Basic property alerts',
      'Chat with agents',
      'Profile page',
    ],
    cta: 'Get Started Free',
    featured: false,
    ctaLink: '/auth/login',
  },
  {
    name: 'Professional',
    monthlyPrice: '৳999',
    yearlyPrice: '৳799',
    desc: 'For active agents and sellers who close deals regularly.',
    features: [
      'List up to 50 properties',
      'Priority listing placement',
      'Advanced analytics dashboard',
      'KYC fast-track verification',
      'Commission tracking',
      'Bulk photo upload',
      'Email + chat support',
    ],
    cta: 'Start Pro Trial',
    featured: true,
    ctaLink: '/auth/login',
  },
  {
    name: 'Business',
    monthlyPrice: '৳2,999',
    yearlyPrice: '৳2,399',
    desc: 'For real estate agencies and large developers.',
    features: [
      'Unlimited listings',
      'Team workspace (up to 10)',
      'Custom branding & landing pages',
      'API access',
      'White-label reports',
      'Dedicated account manager',
      'Priority 24/7 support',
    ],
    cta: 'Contact Sales',
    featured: false,
    ctaLink: '/auth/login',
  },
]

export function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="bg-[#0A0A0F] py-24 lg:py-32 relative overflow-hidden">
      {/* BG accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #C9A96E30, transparent)' }} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="text-center mb-14"
        >
          <motion.p variants={fadeUp} className="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
            Pricing
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#F0EDE8] leading-tight tracking-tight mb-4">
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} className="font-ui text-[#9E9AA0] text-base">
            No hidden fees. Cancel anytime.
          </motion.p>

          {/* Toggle */}
          <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-3">
            <span className={`font-ui text-sm font-medium transition-colors ${!yearly ? 'text-[#F0EDE8]' : 'text-[#5C5866]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setYearly(!yearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${yearly ? 'bg-[#C9A96E]' : 'bg-[#2D2D45]'}`}
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${yearly ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
            <span className={`font-ui text-sm font-medium transition-colors ${yearly ? 'text-[#F0EDE8]' : 'text-[#5C5866]'}`}>
              Yearly
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs font-ui font-semibold bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              Save 20%
            </span>
          </motion.div>
        </motion.div>

        {/* Plans */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch"
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`relative rounded-2xl p-6 flex flex-col transition-transform duration-300 ${
                plan.featured
                  ? 'scale-[1.03] shadow-[0_0_60px_rgba(201,169,110,0.15)]'
                  : 'hover:-translate-y-1'
              }`}
              style={
                plan.featured
                  ? {
                      background: '#111118',
                      border: '1px solid transparent',
                      backgroundClip: 'padding-box',
                      boxShadow: '0 0 0 1px rgba(201,169,110,0.4), 0 0 60px rgba(201,169,110,0.12)',
                    }
                  : { background: '#111118', border: '1px solid #1E1E2E' }
              }
            >
              {plan.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-ui font-semibold text-[#0A0A0F]"
                  style={{ background: 'var(--gradient-gold)' }}>
                  ⭐ Most Popular
                </div>
              )}

              <div className="mb-6">
                <p className="font-ui text-sm font-semibold text-[#9E9AA0] mb-1 uppercase tracking-wider">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-price text-4xl font-medium text-[#F0EDE8]">
                    {plan.monthlyPrice === 'Free' ? 'Free' : (yearly ? plan.yearlyPrice : plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice !== 'Free' && (
                    <span className="font-ui text-sm text-[#5C5866] mb-1">/mo</span>
                  )}
                </div>
                <p className="font-ui text-xs text-[#5C5866] leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: '#C9A96E15', border: '1px solid #C9A96E30' }}>
                      <Check size={10} className="text-[#C9A96E]" />
                    </div>
                    <span className="font-ui text-sm text-[#9E9AA0] leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.ctaLink}
                className={`w-full py-3 rounded-full font-ui font-semibold text-sm text-center tracking-wide transition-all duration-200 ${
                  plan.featured
                    ? 'lp-btn-primary'
                    : 'border border-[#2D2D45] text-[#9E9AA0] hover:border-[#C9A96E]/40 hover:text-[#C9A96E]'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center font-ui text-xs text-[#5C5866] mt-8"
        >
          No credit card required for Starter. Upgrade anytime.
        </motion.p>
      </div>
    </section>
  )
}

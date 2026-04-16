'use client'

import { motion } from 'framer-motion'
import { Banknote, BarChart3, Globe, MessageCircle, Shield, Users2 } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOptions } from '@/lib/animations'

const FEATURES = [
  {
    icon: Users2,
    title: 'Agent Commission Ecosystem',
    desc: 'Agents apply to listings, sellers approve and offer commission deals. Auto-branding shows agent info on property pages. Wallet, withdrawals — all built in.',
    size: 'hero',
    accent: '#C9A96E',
  },
  {
    icon: Banknote,
    title: 'Booking & Installments',
    desc: 'Full payment, installment plans, or rental — with auto-generated schedules, receipts, and status tracking for both buyer and seller.',
    size: 'tall',
    accent: '#3B82F6',
  },
  {
    icon: Globe,
    title: 'Project Landing Pages',
    desc: 'Each project gets a public page with a custom URL. Drag & drop sections, publish instantly.',
    size: 'small',
    accent: '#10B981',
  },
  {
    icon: BarChart3,
    title: 'Admin ERP — HR, Accounts & Ops',
    desc: 'Employee management, payroll, KPI dashboards, expense ledger, audit trail, and Kanban task boards — all in one admin panel.',
    size: 'wide',
    accent: '#C9A96E',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat',
    desc: 'Buyers and agents chat live inside the platform. Instant notifications keep everyone in sync.',
    size: 'small',
    accent: '#3B82F6',
  },
  {
    icon: Shield,
    title: 'KYC & Verified Badges',
    desc: 'Sellers and agents upload NID or trade license. Admin approves — verified badge unlocks publishing.',
    size: 'small',
    accent: '#F43F5E',
  },
]

const gridMap: Record<string, string> = {
  hero:  'md:col-span-8 md:row-span-2',
  tall:  'md:col-span-4 md:row-span-2',
  wide:  'md:col-span-8',
  small: 'md:col-span-4',
}

export function FeaturesSection() {
  return (
    <section className="bg-[#0A0A0F] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="mb-16 max-w-xl"
        >
          <motion.p variants={fadeUp} className="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
            Platform Features
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(2rem,4vw,3rem)] font-light text-[#F0EDE8] leading-[1.1] tracking-tight">
            Everything you need to close deals <span className="lp-gradient-text italic">faster</span>
          </motion.h2>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 md:grid-cols-12 auto-rows-[180px] gap-4"
        >
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`${gridMap[feature.size]} group relative bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 overflow-hidden lp-card-hover cursor-default`}
            >
              {/* Glow orb */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `radial-gradient(ellipse, ${feature.accent}20 0%, transparent 70%)`, filter: 'blur(20px)' }}
              />
              {/* Top border accent */}
              <div
                className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
              />

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: `${feature.accent}15`, border: `1px solid ${feature.accent}25` }}
              >
                <feature.icon size={20} style={{ color: feature.accent }} />
              </div>

              <h3 className="font-display text-lg font-medium text-[#F0EDE8] mb-2 leading-snug">
                {feature.title}
              </h3>
              <p className="font-ui text-sm text-[#9E9AA0] leading-relaxed">
                {feature.desc}
              </p>

              {/* Hero feature extra visual */}
              {feature.size === 'hero' && (
                <div className="absolute bottom-6 right-6 flex gap-2 opacity-40">
                  {[60, 80, 50, 90, 70].map((h, j) => (
                    <div key={j} className="w-2 rounded-full"
                      style={{ height: `${h * 0.6}px`, background: `linear-gradient(to top, ${feature.accent}40, ${feature.accent}80)` }} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

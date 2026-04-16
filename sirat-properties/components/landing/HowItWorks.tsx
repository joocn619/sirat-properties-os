'use client'

import { motion } from 'framer-motion'
import { UserPlus, Search, Handshake } from 'lucide-react'
import { staggerContainer, fadeUp, viewportOptions } from '@/lib/animations'

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Create Account',
    desc: 'Sign up in 30 seconds with Google. Choose your role — Buyer, Seller, or Agent.',
    color: '#C9A96E',
  },
  {
    number: '02',
    icon: Search,
    title: 'Browse or List',
    desc: 'Search from 12,000+ verified listings or list your property with our smart form.',
    color: '#3B82F6',
  },
  {
    number: '03',
    icon: Handshake,
    title: 'Close Deals',
    desc: 'Connect directly, negotiate, book visits, and seal deals — all within the platform.',
    color: '#10B981',
  },
]

export function HowItWorks() {
  return (
    <section className="bg-[#0A0A0F] py-24 lg:py-32 relative overflow-hidden">
      {/* Background number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[20rem] font-bold text-[#C9A96E]/[0.02] pointer-events-none select-none leading-none">
        HOW
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="text-center mb-20"
        >
          <motion.p variants={fadeUp} className="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
            How It Works
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#F0EDE8] leading-tight tracking-tight">
            Three steps to your dream property
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[calc(16.666%+2rem)] right-[calc(16.666%+2rem)] h-px"
            style={{ background: 'linear-gradient(to right, #C9A96E40, #3B82F640, #10B98140)' }} />

          {STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative flex flex-col items-center text-center group"
            >
              {/* Step number background */}
              <div
                className="absolute -top-6 font-display text-7xl font-bold opacity-[0.04] pointer-events-none select-none"
                style={{ color: step.color }}
              >
                {step.number}
              </div>

              {/* Icon circle */}
              <div
                className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `${step.color}10`,
                  border: `1px solid ${step.color}30`,
                  boxShadow: `0 0 0 8px ${step.color}05`,
                }}
              >
                <step.icon size={28} style={{ color: step.color }} />
                {/* Step number badge */}
                <div
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center font-ui text-[10px] font-bold text-[#0A0A0F]"
                  style={{ background: step.color }}
                >
                  {i + 1}
                </div>
              </div>

              <h3 className="font-display text-xl font-medium text-[#F0EDE8] mb-3">{step.title}</h3>
              <p className="font-ui text-sm text-[#9E9AA0] leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

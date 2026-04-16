'use client'

import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { staggerContainer, fadeUp, viewportOptions } from '@/lib/animations'

const TESTIMONIALS = [
  {
    quote: 'সিরাত প্রপার্টিজ আমার ক্যারিয়ার বদলে দিয়েছে। আগে প্রতি মাসে ২টা deal হতো, এখন ৮-১০টা।',
    name: 'রাহুল আহমেদ', role: 'Senior Agent · ঢাকা', rating: 5, color: '#C9A96E',
  },
  {
    quote: 'Property list করার পর মাত্র ৩ দিনে ৪৭টা inquiry পেয়েছি। এই রকম visibility আগে কখনো পাইনি।',
    name: 'সাদিয়া ইসলাম', role: 'Property Developer · চট্টগ্রাম', rating: 5, color: '#3B82F6',
  },
  {
    quote: 'AI matching feature টা অবিশ্বাস্য। আমার budget আর requirements দিয়ে exactly আমি যা চাই তাই দেখিয়েছে।',
    name: 'করিম ভূঁইয়া', role: 'Buyer · সিলেট', rating: 5, color: '#10B981',
  },
  {
    quote: 'Commission tracking আর wallet system টা খুব smooth। টাকা পাওয়ার process এখন completely transparent।',
    name: 'নাজমুল হোসেন', role: 'Real Estate Agent · রাজশাহী', rating: 5, color: '#C9A96E',
  },
  {
    quote: 'KYC process টা simple আর fast। আমার seller account verify হয়েছে মাত্র কয়েক ঘন্টায়।',
    name: 'ফারহানা বেগম', role: 'Property Owner · খুলনা', rating: 5, color: '#3B82F6',
  },
  {
    quote: 'Chat system এ directly buyer এর সাথে কথা বলতে পারি। Deal close করা অনেক সহজ হয়েছে।',
    name: 'তানভীর হাসান', role: 'Agent · বরিশাল', rating: 5, color: '#10B981',
  },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="text-[#C9A96E] text-sm">★</span>
      ))}
    </div>
  )
}

export function Testimonials() {
  return (
    <section className="bg-[#0D0D12] py-24 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="text-center mb-16"
        >
          <motion.p variants={fadeUp} className="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-4">
            Testimonials
          </motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#F0EDE8] leading-tight tracking-tight">
            Loved by agents &amp; buyers across Bangladesh
          </motion.h2>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOptions}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 lp-card-hover flex flex-col gap-4"
            >
              {/* Quote icon */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${t.color}15`, border: `1px solid ${t.color}25` }}
              >
                <Quote size={14} style={{ color: t.color }} />
              </div>

              {/* Stars */}
              <StarRating count={t.rating} />

              {/* Quote */}
              <p className="font-display text-base font-normal text-[#F0EDE8] leading-relaxed italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-[#1E1E2E]">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center font-ui text-sm font-bold text-[#0A0A0F]"
                  style={{ background: t.color }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-ui text-sm font-semibold text-[#F0EDE8]">{t.name}</p>
                  <p className="font-ui text-xs text-[#5C5866]">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

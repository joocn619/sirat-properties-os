'use client'

import { motion } from 'framer-motion'

const LOGOS = [
  'Daily Star', 'Prothom Alo', 'Business Standard BD',
  'Dhaka Tribune', 'The Financial Express', 'Channel i',
  'Daily Star', 'Prothom Alo', 'Business Standard BD',
  'Dhaka Tribune', 'The Financial Express', 'Channel i',
]

export function TrustBar() {
  return (
    <section className="bg-[#0D0D12] border-y border-[#1E1E2E] py-8 overflow-hidden">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#5C5866] mb-6"
      >
        Featured In
      </motion.p>
      <div className="relative flex overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10"
          style={{ background: 'linear-gradient(to right, #0D0D12, transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10"
          style={{ background: 'linear-gradient(to left, #0D0D12, transparent)' }} />

        {/* Marquee */}
        <div
          className="flex gap-12 items-center shrink-0"
          style={{ animation: 'marquee 35s linear infinite' }}
        >
          {LOGOS.map((logo, i) => (
            <div
              key={i}
              className="shrink-0 px-6 py-2 rounded-lg border border-[#1E1E2E] font-ui text-sm font-semibold text-[#5C5866] hover:text-[#C9A96E] hover:border-[#C9A96E]/20 transition-colors duration-300 cursor-default whitespace-nowrap"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

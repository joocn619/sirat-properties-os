'use client'

import { motion } from 'framer-motion'
import { Globe, Layers3, Palette, Link2, Eye, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { fadeUp, staggerContainer, viewportOptions } from '@/lib/animations'

const BUILDER_FEATURES = [
  {
    icon: Layers3,
    title: 'Drag & Drop Sections',
    desc: 'Hero, Gallery, Features, Location, Contact — reorder them visually.',
  },
  {
    icon: Palette,
    title: 'Brand-Ready Design',
    desc: 'Dark luxury template with your project name, photos, and pricing.',
  },
  {
    icon: Link2,
    title: 'Custom URL',
    desc: 'Each project gets a public slug — /projects/your-project-name.',
  },
  {
    icon: Eye,
    title: 'Publish Instantly',
    desc: 'One toggle to go live. No login needed for buyers to view.',
  },
]

export function LandingPageBuilderSection() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-px w-[80%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(201,169,110,0.25)] to-transparent" />
        <div className="absolute -right-40 top-20 size-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_60%)]" />
        <div className="absolute -left-40 bottom-20 size-[400px] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.08),transparent_60%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">

          {/* Left — Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
            className="space-y-8"
          >
            <div className="space-y-5">
              <motion.div variants={fadeUp} className="flex items-center gap-2">
                <Globe className="size-4 text-[#C9A96E]" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A96E]">
                  Landing Page Builder
                </span>
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="font-display text-4xl font-medium leading-[1.1] tracking-[-0.04em] text-[#F0EDE8] md:text-5xl"
              >
                Give every project<br />
                its own <em className="not-italic text-[#C9A96E]">front door</em>.
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="max-w-lg text-base leading-7 text-[#9E9AA0]"
              >
                Sellers create stunning, public landing pages for each property project.
                Custom sections, your branding, a unique URL — all without writing a line
                of code.
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2">
              {BUILDER_FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={f.title}
                    variants={fadeUp}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all duration-300 hover:border-[rgba(201,169,110,0.2)] hover:bg-[rgba(201,169,110,0.03)]"
                  >
                    <div className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-[rgba(201,169,110,0.08)]">
                      <Icon className="size-4 text-[#C9A96E]" />
                    </div>
                    <p className="text-sm font-semibold text-[#F0EDE8]">{f.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#5C5866]">{f.desc}</p>
                  </motion.div>
                )
              })}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                href="/auth/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#C9A96E] px-6 py-3 text-sm font-semibold text-[#0A0A0F] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(201,169,110,0.3)]"
              >
                Start building
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — Visual Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={viewportOptions}
            className="relative"
          >
            {/* Glow */}
            <div className="absolute -inset-8 rounded-[3rem] bg-[radial-gradient(ellipse,rgba(201,169,110,0.1),transparent_60%)] blur-2xl" />

            {/* Browser mockup */}
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-[#0E0E14] shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-white/[0.08]" />
                  <span className="size-2.5 rounded-full bg-white/[0.08]" />
                  <span className="size-2.5 rounded-full bg-white/[0.08]" />
                </div>
                <div className="mx-auto flex items-center gap-1.5 rounded-lg bg-white/[0.04] px-3 py-1">
                  <Globe className="size-3 text-[#5C5866]" />
                  <span className="text-[11px] text-[#5C5866]">siratproperties.com/projects/gulshan-skyline</span>
                </div>
              </div>

              {/* Page content mockup */}
              <div className="space-y-0">
                {/* Hero section mockup */}
                <div className="relative h-52 bg-[linear-gradient(135deg,#1a1a2e_0%,#16213e_40%,#0f3460_70%,#1a1a2e_100%)]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,169,110,0.15),transparent_60%)]" />
                  <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#C9A96E]">
                      Premium Project
                    </p>
                    <p className="mt-1.5 font-display text-2xl font-medium text-[#F0EDE8]">
                      Gulshan Skyline
                    </p>
                    <p className="mt-1 text-[10px] text-[#9E9AA0]">
                      Gulshan-2, Dhaka · 24 Floors · 96 Units
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="rounded-full bg-[rgba(201,169,110,0.15)] px-2.5 py-1 text-[9px] font-semibold text-[#C9A96E]">
                        ৳ 2.4 Cr+
                      </span>
                      <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-[9px] font-semibold text-[#10b981]">
                        42 Available
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gallery section mockup */}
                <div className="border-t border-white/[0.04] p-4">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">
                    Gallery
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="aspect-[4/3] rounded-lg"
                        style={{
                          background: `linear-gradient(${120 + i * 30}deg, rgba(201,169,110,${0.06 + i * 0.02}), rgba(59,130,246,${0.04 + i * 0.015}))`,
                          border: '1px solid rgba(255,255,255,0.04)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Features section mockup */}
                <div className="border-t border-white/[0.04] p-4">
                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">
                    Features
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Gym & Pool', 'CCTV 24/7', 'Underground Parking'].map((f) => (
                      <div
                        key={f}
                        className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-2 py-2 text-center text-[9px] text-[#9E9AA0]"
                      >
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact section mockup */}
                <div className="border-t border-white/[0.04] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">
                        Contact
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#9E9AA0]">
                        Sirat Properties · +880 1XXX-XXXXXX
                      </p>
                    </div>
                    <div className="rounded-lg bg-[rgba(201,169,110,0.12)] px-3 py-1.5 text-[9px] font-semibold text-[#C9A96E]">
                      WhatsApp
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating editor panel */}
            <div className="absolute -left-6 bottom-16 z-20 w-44 rounded-2xl border border-white/[0.08] bg-[#0E0E14]/95 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md lg:-left-10">
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#C9A96E]">
                Sections
              </p>
              <div className="space-y-1.5">
                {['Hero', 'Gallery', 'Features', 'Location', 'Contact'].map((s, i) => (
                  <div
                    key={s}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] ${
                      i === 0
                        ? 'bg-[rgba(201,169,110,0.1)] font-semibold text-[#C9A96E]'
                        : 'text-[#9E9AA0] hover:bg-white/[0.03]'
                    }`}
                  >
                    <span className="flex size-4 items-center justify-center rounded bg-white/[0.06] text-[8px] font-bold text-[#5C5866]">
                      {i + 1}
                    </span>
                    {s}
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-1">
                <div className="flex-1 rounded-md bg-[rgba(201,169,110,0.12)] py-1 text-center text-[8px] font-semibold text-[#C9A96E]">
                  Reorder
                </div>
                <div className="flex-1 rounded-md bg-white/[0.04] py-1 text-center text-[8px] font-semibold text-[#9E9AA0]">
                  Edit
                </div>
              </div>
            </div>

            {/* Floating publish badge */}
            <div className="absolute -right-4 top-20 z-20 flex items-center gap-2 rounded-full border border-[rgba(16,185,129,0.2)] bg-[#0E0E14]/95 px-3 py-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.4)] backdrop-blur-md lg:-right-8">
              <span className="size-2 rounded-full bg-[#10b981]" />
              <span className="text-[10px] font-semibold text-[#10b981]">Published</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

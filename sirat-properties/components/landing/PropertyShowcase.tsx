'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, BedDouble, Bath, Maximize2, ArrowUpRight } from 'lucide-react'
import { staggerContainer, fadeUp, viewportOptions } from '@/lib/animations'

const TABS = ['All', 'For Sale', 'For Rent', 'Commercial'] as const

const PROPERTIES = [
  {
    id: '1', title: 'Luxe Tower Residences', location: 'গুলশান-2, ঢাকা',
    price: '৳2.8 Cr', tag: 'For Sale', beds: 4, baths: 3, area: '2200',
    gradient: 'linear-gradient(135deg, #1a2a40 0%, #0f1a2e 100%)',
    accentColor: '#C9A96E', verified: true,
  },
  {
    id: '2', title: 'Green Valley Apartments', location: 'বারিধারা, ঢাকা',
    price: '৳65K/mo', tag: 'For Rent', beds: 3, baths: 2, area: '1600',
    gradient: 'linear-gradient(135deg, #0f2a1a 0%, #0a1a10 100%)',
    accentColor: '#10B981', verified: true,
  },
  {
    id: '3', title: 'Chittagong Commerce Hub', location: 'আগ্রাবাদ, চট্টগ্রাম',
    price: '৳1.5 Cr', tag: 'Commercial', beds: 0, baths: 2, area: '3400',
    gradient: 'linear-gradient(135deg, #1a1a2a 0%, #0f0f1a 100%)',
    accentColor: '#3B82F6', verified: false,
  },
  {
    id: '4', title: 'Bashundhara Premium Villa', location: 'বসুন্ধরা, ঢাকা',
    price: '৳4.2 Cr', tag: 'For Sale', beds: 5, baths: 4, area: '4000',
    gradient: 'linear-gradient(135deg, #2a1a0f 0%, #1a0f0a 100%)',
    accentColor: '#C9A96E', verified: true,
  },
  {
    id: '5', title: 'Sylhet Garden Homes', location: 'জালালাবাদ, সিলেট',
    price: '৳85K/mo', tag: 'For Rent', beds: 3, baths: 2, area: '1800',
    gradient: 'linear-gradient(135deg, #0f2a10 0%, #0a1a08 100%)',
    accentColor: '#10B981', verified: true,
  },
  {
    id: '6', title: 'Khulna Business Center', location: 'শিববাড়ি, খুলনা',
    price: '৳90L', tag: 'Commercial', beds: 0, baths: 1, area: '2100',
    gradient: 'linear-gradient(135deg, #0f1a2a 0%, #080f1a 100%)',
    accentColor: '#3B82F6', verified: false,
  },
]

export function PropertyShowcase() {
  const [activeTab, setActiveTab] = useState<string>('All')

  const filtered = activeTab === 'All'
    ? PROPERTIES
    : PROPERTIES.filter((p) => p.tag === activeTab)

  return (
    <section className="bg-[#0D0D12] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOptions}
          >
            <motion.p variants={fadeUp} className="font-ui text-xs font-semibold tracking-[0.2em] uppercase text-[#C9A96E] mb-3">
              Featured Properties
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-light text-[#F0EDE8] leading-tight tracking-tight">
              Handpicked for you
            </motion.h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/properties" className="inline-flex items-center gap-2 font-ui text-sm font-medium text-[#9E9AA0] hover:text-[#C9A96E] transition-colors group">
              View All Properties
              <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex gap-2 mb-8 overflow-x-auto pb-2"
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 px-4 py-2 rounded-full font-ui text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[#C9A96E] text-[#0A0A0F]'
                  : 'border border-[#1E1E2E] text-[#9E9AA0] hover:border-[#2D2D45] hover:text-[#F0EDE8]'
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((prop, i) => (
              <motion.div
                key={prop.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={`/properties/${prop.id}`} className="group block">
                  <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl overflow-hidden lp-card-hover">
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden" style={{ background: prop.gradient }}>
                      {/* Fake building */}
                      <div className="absolute inset-0 flex items-end justify-center pb-0 gap-2 px-8">
                        {[35, 55, 75, 60, 40, 28].map((h, j) => (
                          <div key={j} className="rounded-t transition-transform duration-700 group-hover:scale-105"
                            style={{
                              width: '18px', height: `${h}%`,
                              background: `rgba(${prop.accentColor === '#C9A96E' ? '201,169,110' : prop.accentColor === '#10B981' ? '16,185,129' : '59,130,246'},0.12)`,
                              border: `1px solid rgba(${prop.accentColor === '#C9A96E' ? '201,169,110' : prop.accentColor === '#10B981' ? '16,185,129' : '59,130,246'},0.2)`,
                            }} />
                        ))}
                      </div>
                      <div className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(10,10,15,0.9) 0%, transparent 50%)' }} />

                      {/* Price badge */}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0A0F]/80 backdrop-blur-sm border border-[#2D2D45]">
                        <span className="font-price text-sm font-medium" style={{ color: prop.accentColor }}>
                          {prop.price}
                        </span>
                      </div>

                      {/* Verified */}
                      {prop.verified && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
                          <span className="text-[#10B981] text-xs">✓</span>
                        </div>
                      )}

                      {/* View details on hover */}
                      <div className="absolute inset-x-0 bottom-0 flex justify-center pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                        <span className="px-4 py-2 rounded-full bg-[#C9A96E] text-[#0A0A0F] text-xs font-ui font-semibold">
                          View Details →
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-4">
                      <h3 className="font-display text-base font-medium text-[#F0EDE8] mb-1 leading-snug">{prop.title}</h3>
                      <p className="font-ui text-xs text-[#5C5866] flex items-center gap-1 mb-3">
                        <MapPin size={11} />{prop.location}
                      </p>
                      <div className="flex items-center gap-4 pt-3 border-t border-[#1E1E2E] font-ui text-xs text-[#9E9AA0]">
                        {prop.beds > 0 && (
                          <span className="flex items-center gap-1"><BedDouble size={12} />{prop.beds}</span>
                        )}
                        <span className="flex items-center gap-1"><Bath size={12} />{prop.baths}</span>
                        <span className="flex items-center gap-1"><Maximize2 size={12} />{prop.area} sqft</span>
                        <span className="ml-auto px-2 py-0.5 rounded-full text-xs border"
                          style={{
                            borderColor: `${prop.accentColor}30`,
                            color: prop.accentColor,
                            background: `${prop.accentColor}08`,
                          }}>
                          {prop.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

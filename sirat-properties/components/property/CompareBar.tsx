'use client'

import { X, GitCompareArrows } from 'lucide-react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useCompare } from './CompareContext'

export function CompareBar() {
  const { items, remove, clear } = useCompare()

  if (items.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
      >
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0E0E14]/95 px-4 py-3 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {/* Property thumbnails */}
          <div className="flex items-center gap-2">
            {items.map((item) => (
              <div key={item.id} className="group relative">
                <div className="size-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111118]">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[#5C5866]">
                      {item.title[0]}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#1E1E2E] text-[#9E9AA0] opacity-0 transition group-hover:opacity-100 hover:bg-[rgba(244,63,94,0.2)] hover:text-[#f43f5e]"
                >
                  <X className="size-2.5" />
                </button>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 3 - items.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex size-10 items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                <span className="text-[10px] text-[#5C5866]">+</span>
              </div>
            ))}
          </div>

          <div className="h-8 w-px bg-white/[0.06]" />

          <span className="text-xs font-semibold text-[var(--text-tertiary)]">
            {items.length}/3
          </span>

          {/* Actions */}
          <Link
            href={`/buyer/compare?ids=${items.map(i => i.id).join(',')}`}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
              items.length >= 2
                ? 'bg-[#C9A96E] text-[#0A0A0F] hover:shadow-[0_4px_16px_rgba(201,169,110,0.3)]'
                : 'bg-white/[0.04] text-[var(--text-tertiary)] pointer-events-none opacity-50'
            }`}
          >
            <GitCompareArrows className="size-3.5" />
            Compare
          </Link>

          <button
            type="button"
            onClick={clear}
            className="rounded-lg p-1.5 text-[var(--text-tertiary)] transition hover:bg-white/[0.06] hover:text-[var(--text-secondary)]"
            title="Clear all"
          >
            <X className="size-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

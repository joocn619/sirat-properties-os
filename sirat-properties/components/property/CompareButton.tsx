'use client'

import { GitCompareArrows } from 'lucide-react'
import { useCompare } from './CompareContext'
import toast from 'react-hot-toast'

export function CompareButton({
  property,
  size = 'md',
}: {
  property: { id: string; title: string; image?: string }
  size?: 'sm' | 'md'
}) {
  const { add, remove, has, isFull } = useCompare()
  const active = has(property.id)

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (active) {
      remove(property.id)
      toast.success('Removed from compare')
    } else if (isFull) {
      toast.error('Max 3 properties to compare')
    } else {
      add(property)
      toast.success('Added to compare')
    }
  }

  const s = size === 'sm' ? 'size-8' : 'size-10'
  const iconSize = size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <button
      type="button"
      onClick={toggle}
      className={`${s} flex items-center justify-center rounded-xl border transition-all duration-200 ${
        active
          ? 'border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.12)] text-[#3B82F6]'
          : 'border-white/[0.08] bg-[#0A0A0F]/60 text-[var(--text-tertiary)] backdrop-blur-sm hover:border-white/[0.15] hover:text-[var(--text-secondary)]'
      }`}
      title={active ? 'Remove from compare' : 'Add to compare'}
    >
      <GitCompareArrows className={iconSize} />
    </button>
  )
}

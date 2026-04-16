'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface CompareItem {
  id: string
  title: string
  image?: string
}

interface CompareContextType {
  items: CompareItem[]
  add: (item: CompareItem) => void
  remove: (id: string) => void
  clear: () => void
  has: (id: string) => boolean
  isFull: boolean
}

const Ctx = createContext<CompareContextType | null>(null)

const MAX = 3

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  const add = useCallback((item: CompareItem) => {
    setItems(prev => {
      if (prev.length >= MAX || prev.some(p => p.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(p => p.id !== id))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const has = useCallback((id: string) => items.some(p => p.id === id), [items])

  return (
    <Ctx.Provider value={{ items, add, remove, clear, has, isFull: items.length >= MAX }}>
      {children}
    </Ctx.Provider>
  )
}

export function useCompare() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCompare must be used within CompareProvider')
  return ctx
}

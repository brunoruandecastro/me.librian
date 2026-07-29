"use client"

import { createContext, useContext, useMemo, useState, ReactNode } from 'react'

type ShelfContextValue = {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

const ShelfContext = createContext<ShelfContextValue | undefined>(undefined)

export function ShelfProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(
    () => ({
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((current) => !current),
    }),
    [isOpen],
  )

  return <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>
}

export function useShelf() {
  const context = useContext(ShelfContext)
  if (!context) {
    throw new Error('useShelf must be used within a ShelfProvider')
  }
  return context
}

import React, { createContext, useContext, useState } from 'react'

type ContextType = {
  open: boolean
  setOpen: (v: boolean) => void
  toggle: () => void
}

const GlobalSidebarContext = createContext<ContextType | null>(null)

export function GlobalSidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen((v) => !v)

  return (
    <GlobalSidebarContext.Provider value={{ open, setOpen, toggle }}>
      {children}
    </GlobalSidebarContext.Provider>
  )
}

export function useGlobalSidebar() {
  const ctx = useContext(GlobalSidebarContext)
  if (!ctx) throw new Error('useGlobalSidebar must be used within GlobalSidebarProvider')
  return ctx
}

import React from 'react'
import { useGlobalSidebar } from './GlobalSidebarContext'

export default function GlobalSidebarTrigger({ className }: { className?: string }) {
  const { toggle } = useGlobalSidebar()

  return (
    <button
      onClick={toggle}
      className={className || 'rounded-md p-2 border'}
      aria-label="Toggle sidebar"
    >
      ☰
    </button>
  )
}

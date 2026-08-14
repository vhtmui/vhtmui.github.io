import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dufs/')({ component: Dufs })

function Dufs() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">Dufs</h1>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dufs/')({ component: Dufs })

function Dufs() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell p-6">
        <h1 className="text-2xl font-bold">Dufs</h1>
        <p className="mt-4">占位页面：原 Svelte 项目中存在该页面，但尚未实现功能。</p>
      </section>
    </main>
  )
}

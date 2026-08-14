import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/error/')({ component: ErrorPage })

function ErrorPage() {
  // This route is a simple error display page similar to the Svelte +error.svelte
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
        <h1>发生错误</h1>
        <button onClick={() => window.history.back()} className="rounded-md border px-4 py-2">返回</button>
      </div>
    </main>
  )
}

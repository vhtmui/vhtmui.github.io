import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/error/')({ component: ErrorPage })

function ErrorPage() {
  return (
    <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center' }}>
      <h1>发生错误</h1>
      <button onClick={() => window.history.back()} className="btn btn-outline btn-lg">Back</button>
    </div>
  )
}

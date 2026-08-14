import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/testpage/')({ component: TestPage })

function TestPage() {
  return (
    <div className="p-8">
      <h1>
        <a><svg height="10" width="10"><circle cx="5" cy="5" r="5" fill="black" /></svg></a>
        Test Page
      </h1>
    </div>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/docs/')({ component: DocsIndex })

function DocsIndex() {
  const [posts, setPosts] = useState<Array<{ slug: string; title: string }>>([])

  useEffect(() => {
    fetch('/content/manifest.json')
      .then((r) => r.json())
      .then((data) => setPosts(data.map((p: any) => ({ slug: encodeURIComponent(p.slug), title: p.title })) ))
      .catch(() => setPosts([]))
  }, [])

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1 className="text-3xl font-bold mb-4">Docs / Blogs</h1>
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.slug}>
            <a href={`/docs/${p.slug}`} className="text-blue-600 underline">
              {p.title}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}

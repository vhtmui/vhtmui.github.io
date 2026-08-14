import React, { useEffect, useState } from 'react'
import { useGlobalSidebar } from './GlobalSidebarContext'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export default function GlobalSidebar() {
  const { open, setOpen } = useGlobalSidebar()
  const [posts, setPosts] = useState<Array<{ slug: string; title: string }>>([])

  useEffect(() => {
    fetch('/content/manifest.json')
      .then((r) => r.json())
      .then((data) => setPosts(data.map((p: any) => ({ slug: encodeURIComponent(p.slug), title: p.title }))))
      .catch(() => setPosts([]))
  }, [])

  return (
    <aside
      aria-hidden={!open}
      className={`fixed top-14 left-0 h-[calc(100vh-56px)] w-72 bg-white dark:bg-gray-900 border-r p-4 transform transition-transform ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">目录</h3>
        <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Close sidebar">
          ✕
        </Button>
      </div>
      <nav>
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link to={`/docs/${p.slug}`} className="no-underline">
                <Button asChild variant="ghost" size="sm">
                  <a>{p.title}</a>
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

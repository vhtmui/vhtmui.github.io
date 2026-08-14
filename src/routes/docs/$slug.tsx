import { createFileRoute, useParams } from '@tanstack/react-router'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import { useEffect, useState } from 'react'
import matter from 'gray-matter'

export const Route = createFileRoute('/docs/$slug')({ component: DocPage })

function DocPage() {
  const params = useParams() as any
  const slug = decodeURIComponent(params.slug)
  const [source, setSource] = useState<string>('')

  useEffect(() => {
    fetch(`/content/blogs/${slug}.md`)
      .then((r) => r.text())
      .then((t) => {
        const parsed = matter(t)
        // we could use parsed.data for metadata
        setSource(parsed.content)
      })
      .catch(() => setSource(''))
  }, [slug])

  if (!source) return <main className="page-wrap px-4 pb-8 pt-14">加载中…</main>

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <MarkdownRenderer source={source} />
    </main>
  )
}

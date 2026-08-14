import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/mac-converter/')({ component: MacConverter })

function MacConverter() {
  const [html, setHtml] = useState<string>('')

  useEffect(() => {
    fetch('/build/mac-converter.html')
      .then((r) => r.text())
      .then((t) => setHtml(t))
      .catch(() => setHtml('<p>无法加载页面。</p>'))
  }, [])

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  )
}

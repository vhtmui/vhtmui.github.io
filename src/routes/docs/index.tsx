import { createFileRoute, Link } from '@tanstack/react-router'
import { Route as docsLayoutRoute } from '../docs'

export const Route = createFileRoute('/docs/')({ component: DocsIndex })

function DocsIndex() {
  const { items } = docsLayoutRoute.useLoaderData()

  return (
    <ul className="p-4">
      {items
        .filter((d) => !d.isDirectory)
        .map((d) => {
          const slug = d.relativePath.replace(/^docs\//, '').replace(/\.md$/, '')
          const label = d.name.replace(/\.md$/, '')
          return (
            <li key={slug}>
              <Link to={`/docs/$slug`} params={{ slug }}>{label}</Link>
            </li>
          )
        })}
    </ul>
  )
}

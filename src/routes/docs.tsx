import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { FolderOpen } from 'lucide-react'
import {
  setSidebarMenuItems,
  useGlobalSidebar,
  type GlobalSidebarMenuItem,
} from '@/components/my/GlobalSidebar'
import { getDocsManifest } from '@/lib/docs-functions'

export const Route = createFileRoute('/docs')({
  loader: () => getDocsManifest(),
  component: DocsLayout,
})

function DocsLayout() {
  const { setItemData } = useGlobalSidebar()
  const data = Route.useLoaderData()

  useEffect(() => {
    const items: GlobalSidebarMenuItem[] = data.items.map((d) => {
      const mdPath = d.relativePath.replace(/^docs\//, '').replace(/\.md$/, '')
      const label = d.name.replace(/\.md$/, '')
      const href = `/docs/${mdPath}`
      const open = true
      const Icon = d.isDirectory ? <FolderOpen /> : null
      return {
        path: mdPath,
        label,
        href,
        Icon,
        open,
        highlight: false,
        children: [],
      }
    })

    setSidebarMenuItems(items, 'docs', setItemData)

    return () => {
      setItemData(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return (
    <div className="docs-layout min-w-0">
      <Outlet />
    </div>
  )
}

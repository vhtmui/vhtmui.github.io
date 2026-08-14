import { Link } from '@tanstack/react-router'
import { useLocation } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

export default function Navigator() {
  const location = useLocation()
  const pathname = location.pathname
  const parts = pathname.split('/').filter(Boolean)

  const crumbs = parts.map((part, index) => {
    const name = decodeURIComponent(part)
    const href = '/' + parts.slice(0, index + 1).join('/')
    return { name, href }
  })
  crumbs.unshift({ name: 'Home', href: '/' })

  return (
    <div className="mr-auto w-full">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((item, i) => (
            <BreadcrumbItem key={item.href}>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{item.name}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink render={<Link to={item.href as any}>{item.name}</Link>} />
                  <BreadcrumbSeparator />
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

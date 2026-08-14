import { Fragment } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
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

  // Split by '/' first, then decode each part.
  // If a decoded part contains '/' (e.g. from %2F encoding), split it further.
  const rawParts = pathname.split('/').filter(Boolean)
  const parts: string[] = []
  for (const part of rawParts) {
    const decoded = decodeURIComponent(part)
    const subParts = decoded.split('/')
    parts.push(...subParts)
  }

  const crumbs = parts.map((part, index) => {
    const name = part
    const href = '/' + parts.slice(0, index + 1).join('/')
    return { name, href }
  })
  crumbs.unshift({ name: 'Home', href: '/' })

  return (
    <div className="mr-auto w-full">
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((item, i) => (
            <Fragment key={item.href}>
              <BreadcrumbItem>
                {i === crumbs.length - 1 ? (
                  <BreadcrumbPage>{item.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={item.href}>{item.name}</Link>}
                  />
                )}
              </BreadcrumbItem>
              {i !== crumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

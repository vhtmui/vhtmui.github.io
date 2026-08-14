import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

export default function Navigator() {
  if (typeof window === 'undefined') return null

  const parts = window.location.pathname.split('/').filter(Boolean)
  const crumbs: Array<{ name: string; href: string }> = []
  for (let i = 0; i < parts.length; i++) {
    const name = decodeURIComponent(parts[i])
    const href = '/' + parts.slice(0, i + 1).join('/')
    crumbs.push({ name, href })
  }

  return (
    <div className="mr-auto w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={({ className, children, ...props }) => (
              <Link to="/" className={className} {...props}>
                {children}
              </Link>
            )}>
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>

          {crumbs.map((c, i) => (
            <BreadcrumbItem key={c.href}>
              {i === crumbs.length - 1 ? (
                <BreadcrumbPage>{c.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={({ className, children, ...props }) => (
                  <Link to={c.href} className={className} {...props}>
                    {children}
                  </Link>
                )}>{c.name}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

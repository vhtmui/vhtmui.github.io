import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import Header from '../components/Header'
import { SidebarProvider } from '@/components/ui/sidebar'
import GlobalSidebar, { GlobalSidebarTrigger, GlobalSidebarProvider } from '../components/my/GlobalSidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'My Site' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const [headerTop, setHeaderTop] = useState(0)
  const [lastScrollTop, setLastScrollTop] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const currentScrollTop = window.scrollY
      const scrollDelta = currentScrollTop - lastScrollTop

      setHeaderTop((prev) => {
        if (scrollDelta > 0 && prev > -56) {
          return Math.max(prev - scrollDelta, -56)
        } else if (scrollDelta < 0 && prev < 0) {
          return Math.min(prev - scrollDelta, 0)
        }
        return prev
      })
      setLastScrollTop(currentScrollTop)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollTop])

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere]">
        <TooltipProvider>
          <GlobalSidebarProvider>
            <Header top={headerTop} />
            <SidebarProvider className="pt-14 wrap-break-word">
              <GlobalSidebarTrigger className="fixed top-[calc(50vh-32px)] h-16 w-6 rotate-180 rounded-sm opacity-90" />
              <GlobalSidebar top={headerTop + 56} />
              <main className="content flex-1 overflow-wrap-break-word overflow-x-auto">
                {children}
              </main>
            </SidebarProvider>
          </GlobalSidebarProvider>
        </TooltipProvider>
        <TanStackDevtools
          config={{ position: 'bottom-right' }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

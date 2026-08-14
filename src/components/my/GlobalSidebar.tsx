import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ChevronLeft, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  useSidebar,
} from '@/components/ui/sidebar'

// ============================================================================
// Types
// ============================================================================

export interface GlobalSidebarMenuItem {
  path: string
  label: string
  href: string
  Icon?: ReactNode | null
  open: boolean
  highlight: boolean
  children: GlobalSidebarMenuItem[]
}

interface GlobalSidebarOptions {
  header?: ReactNode | null
  footer?: ReactNode | null
}

interface SidebarContextValue {
  itemData: Map<string, GlobalSidebarMenuItem> | null
  option: GlobalSidebarOptions
  setItemData: (data: Map<string, GlobalSidebarMenuItem> | null) => void
  setOption: (opt: Partial<GlobalSidebarOptions>) => void
}

// ============================================================================
// Context
// ============================================================================

const SidebarCtx = createContext<SidebarContextValue>({
  itemData: null,
  option: { header: null, footer: null },
  setItemData: () => {},
  setOption: () => {},
})

export function useGlobalSidebar() {
  return useContext(SidebarCtx)
}

export function GlobalSidebarProvider({ children }: { children: ReactNode }) {
  const [itemData, setItemData] = useState<Map<string, GlobalSidebarMenuItem> | null>(null)
  const [option, setOptionState] = useState<GlobalSidebarOptions>({ header: null, footer: null })

  const setOption = useCallback((opt: Partial<GlobalSidebarOptions>) => {
    setOptionState((prev) => ({ ...prev, ...opt }))
  }, [])

  return (
    <SidebarCtx.Provider value={{ itemData, option, setItemData, setOption }}>
      {children}
    </SidebarCtx.Provider>
  )
}

// ============================================================================
// Helper: build menu tree
// ============================================================================

export function setSidebarMenuItems(
  items: GlobalSidebarMenuItem[],
  nameToRoot: string,
  setItemData: (data: Map<string, GlobalSidebarMenuItem> | null) => void,
) {
  const map = new Map<string, GlobalSidebarMenuItem>()
  items
    .map((item) => {
      item.path = item.path.replaceAll(/\\+/g, '/')
      if (item.path.startsWith('/')) item.path = item.path.slice(1)
      return item
    })
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length)
    .forEach((item) => {
      map.set(item.path, item)
      const parentPath = item.path.split('/').slice(0, -1).join('/')
      if (parentPath && map.has(parentPath)) {
        map.get(parentPath)!.children.push(item)
      }
    })

  if (map.has(nameToRoot)) {
    const root = map.get(nameToRoot)!
    map.delete(nameToRoot)
    map.set('root', root)
  }

  setItemData(map)
}

// ============================================================================
// Trigger Button
// ============================================================================

export function GlobalSidebarTrigger({ className, ...rest }: { className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('cursor-pointer hover:text-primary', className)}
      onClick={toggleSidebar}
      {...rest}
    >
      <ChevronLeft />
    </Button>
  )
}

// ============================================================================
// Collapsible Menu Item (inline implementation, no external collapsible dep)
// ============================================================================

function CollapsibleMenuItem({ item }: { item: GlobalSidebarMenuItem }) {
  const [open, setOpen] = useState(item.open)
  const isDirectory = item.Icon !== null && item.Icon !== undefined

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen(!open)}>
        {isDirectory && (open ? <FolderOpen /> : <Folder />)}
        <span>{item.label}</span>
      </SidebarMenuButton>
      {open && item.children.length > 0 && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <CollapsibleMenuItem key={child.href} item={child} />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  )
}

function MenuItem({ item }: { item: GlobalSidebarMenuItem }) {
  if (item.children.length > 0) {
    return <CollapsibleMenuItem item={item} />
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton render={<a href={item.href} />}>
        {item.Icon}
        <span>{item.label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

// ============================================================================
// GlobalSidebar Component
// ============================================================================

export default function GlobalSidebar({ top }: { top?: number }) {
  const { itemData, option } = useGlobalSidebar()
  const { open } = useSidebar()

  return (
    <Sidebar style={{ top: top ? `${top}px` : undefined }}>
      <GlobalSidebarTrigger
        className="absolute top-[calc(50vh-32px)] right-1 h-16 w-6 rounded-md transition-none"
        hidden={!open ? true : undefined}
        style={{ display: open ? undefined : 'none' }}
      />
      <GlobalSidebarTrigger
        className="absolute top-[calc(50vh-32px)] -right-7 h-16 w-6 rotate-180 rounded-md transition-none"
        style={{ display: open ? 'none' : undefined }}
      />
      {option.header && (
        <SidebarHeader>{option.header}</SidebarHeader>
      )}
      <SidebarContent className="p-2">
        <SidebarMenu>
          {itemData?.get('root') && (
            <MenuItem item={itemData.get('root')!} />
          )}
        </SidebarMenu>
      </SidebarContent>
      {option.footer && (
        <SidebarFooter>{option.footer}</SidebarFooter>
      )}
    </Sidebar>
  )
}

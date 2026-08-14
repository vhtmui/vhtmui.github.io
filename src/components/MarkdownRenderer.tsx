import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeToc, { type Options as RehypeTocOptions } from 'rehype-toc'
import rehypeShikiFromHighlighter from '@shikijs/rehype/core'
import {
  createHighlighterCore,
  type HighlighterCore,
  type LanguageInput,
} from 'shiki/core'
import { createOnigurumaEngine } from 'shiki/engine/oniguruma'
import { Check, Copy } from 'lucide-react'
import type { Element } from 'hast'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================================
// Type Definitions
// ============================================================================

/** TOC 标记的特殊 CSS 类名，与 Svelte 原项目保持一致 */
export const NAV_FLAG_CLASS = 'vvvvvvvvvvvh'

/** MarkdownRenderer Props */
export interface MarkdownRendererProps {
  /** Markdown 源文本 */
  source: string
  /** 文档名称/路径，用于选择代码高亮语言 */
  docName?: string
  /** 自定义 CSS 类名 */
  className?: string
}

/** 基础 HTML 元素属性 */
interface HtmlElementProps {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  id?: string
  [key: string]: unknown
}

/** rehype-toc 生成的自定义 nav 元素属性 */
interface NavElementProps extends HtmlElementProps {
  node?: Element
}

/** 代码块 pre 元素属性 */
interface PreElementProps extends HtmlElementProps {
  node?: Element
}

/** Shiki 双主题配置（用 string 宽松类型兼容 shiki v4） */
interface ShikiDualTheme {
  light: string
  dark: string
}

// ============================================================================
// Constants
// ============================================================================

const SHIKI_THEMES: ShikiDualTheme = {
  light: 'slack-ochin',
  dark: 'slack-dark',
}

const REHYPE_TOC_OPTIONS: RehypeTocOptions = {
  headings: ['h2', 'h3', 'h4', 'h5', 'h6'],
  cssClasses: {
    toc: NAV_FLAG_CLASS,
  },
}

// ============================================================================
// Shiki Highlighter Singleton Context
// ============================================================================

interface ShikiContextValue {
  highlighter: HighlighterCore | null
  isLoading: boolean
  error: Error | null
}

const ShikiContext = createContext<ShikiContextValue>({
  highlighter: null,
  isLoading: true,
  error: null,
})

const useShiki = () => useContext(ShikiContext)

interface ShikiProviderProps {
  docName?: string
  children: React.ReactNode
}

function resolveLanguageImports(docName?: string): LanguageInput[] {
  const name = docName?.toLowerCase() ?? ''
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const langs: any[] = []

  // dynamic imports - cast to avoid complex type mismatch
  if (/powershell/.test(name)) {
    langs.push(import('shiki/langs/powershell.mjs'))
  }
  if (/rust/.test(name)) {
    langs.push(import('shiki/langs/rust.mjs'))
  }
  if (/web/.test(name)) {
    langs.push(
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/css.mjs'),
    )
  }

  return langs as LanguageInput[]
}

function ShikiProvider({ docName, children }: ShikiProviderProps) {
  const [state, setState] = useState<ShikiContextValue>({
    highlighter: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    async function initHighlighter() {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const themes: any = [
          import('shiki/themes/slack-dark.mjs'),
          import('shiki/themes/slack-ochin.mjs'),
        ]

        const highlighter = await createHighlighterCore({
          themes,
          langs: resolveLanguageImports(docName),
          engine: createOnigurumaEngine(import('shiki/wasm')),
        })

        if (!cancelled) {
          setState({ highlighter, isLoading: false, error: null })
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            highlighter: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
        }
      }
    }

    initHighlighter()

    return () => {
      cancelled = true
    }
  }, [docName])

  return (
    <ShikiContext.Provider value={state}>{children}</ShikiContext.Provider>
  )
}

// ============================================================================
// Custom Components Mapping
// ============================================================================

// ---- Heading components ----
function H1({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h1
      className={cn(
        'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h1>
  )
}

function H2({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-3xl font-bold tracking-tight first:mt-0 my-3',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h2>
  )
}

function H3({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h3
      className={cn(
        'scroll-m-20 text-2xl font-semibold tracking-tight my-2',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h3>
  )
}

function H4({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h4
      className={cn(
        'scroll-m-20 text-xl font-semibold tracking-tight my-2',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h4>
  )
}

function H5({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h5
      className={cn(
        'scroll-m-20 text-lg font-semibold tracking-tight my-1',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h5>
  )
}

function H6({ children, className, style, ...rest }: HtmlElementProps) {
  return (
    <h6
      className={cn(
        'scroll-m-20 text-base font-semibold tracking-tight my-1',
        className,
      )}
      style={style}
      {...rest}
    >
      {children}
    </h6>
  )
}

// ---- Code block with copy button ----
function PreWithCopy({
  children,
  className,
  ...rest
}: PreElementProps) {
  const preRef = React.useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (copied || !preRef.current) return
    const codeText = preRef.current.textContent ?? ''
    try {
      await navigator.clipboard.writeText(codeText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // silently ignore clipboard errors
    }
  }

  return (
    <div className="group relative">
      <pre
        ref={preRef}
        contentEditable={false}
        className={cn('border-2 pr-12 scrollbar-thin', className)}
        {...rest}
      >
        {children}
      </pre>
      <Button
        type="button"
        size="icon"
        variant="outline"
        className={cn(
          'absolute top-2 right-2',
          'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
        )}
        disabled={copied}
        onClick={handleCopy}
        aria-label={copied ? '已复制' : '复制代码'}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </Button>
    </div>
  )
}

// ---- TOC Nav renderer (matches navFlagClass) ----
interface TocNodeProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TocNode({ node }: TocNodeProps): any {
  if (node.type !== 'element') {
    if (node.type === 'text') {
      return node.value as string
    }
    return null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const { tagName, properties = {}, children } = node
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const rawClassName: unknown = properties?.className
  const className = typeof rawClassName === 'string' ? rawClassName : Array.isArray(rawClassName) ? rawClassName.join(' ') : ''
  const isTopLevel = className.includes('toc-level-1')
  const mergedClassName = cn(className, isTopLevel ? 'menu' : '')
  const { className: _omit, ...restProps } = (properties ?? {}) as Record<string, unknown>

  const resolvedTagName: string = tagName === 'ol' ? 'ul' : (tagName as string)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
  const childArray: unknown[] = Array.isArray(children) ? children : []

  let innerContent: React.ReactNode = null

  if (tagName === 'li') {
    if (childArray.length > 1) {
      const firstChild = childArray[0]
      const restChildren = childArray.slice(1)
      innerContent = (
        <details className="group">
          <summary className="cursor-pointer list-none marker:content-none">
            <TocNode node={firstChild} />
          </summary>
          <div className="ml-2 mt-1 border-l pl-3">
            {restChildren.map((child, index) => (
              <TocNode key={index} node={child} />
            ))}
          </div>
        </details>
      )
    } else if (childArray.length === 1) {
      innerContent = <TocNode node={childArray[0]} />
    } else {
      innerContent = null
    }
  } else {
    innerContent = (
      <>
        {isTopLevel && (
          <li className="menu-title mb-2 font-semibold text-sm uppercase tracking-wider">
            OutLine
          </li>
        )}
        {childArray.map((child, index) => (
          <TocNode key={index} node={child} />
        ))}
      </>
    )
  }

  // 使用 createElement + 宽松类型避免动态 JSX 标签报错
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
  return React.createElement(resolvedTagName as any, { className: mergedClassName, ...restProps }, innerContent)
}

function TocNav({ children, className, node, ...rest }: NavElementProps) {
  // If this nav does not have the flag class, render children as normal
  const classNameStr = typeof className === 'string' ? className : ''
  if (!classNameStr.includes(NAV_FLAG_CLASS)) {
    return (
      <nav className={cn(className)} {...rest}>
        {children}
      </nav>
    )
  }

  // Render TOC tree structure from the raw HAST node
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const astChildren: unknown[] = Array.isArray(node?.children) ? (node.children as unknown[]) : []

  return (
    <nav
      className={cn(
        'not-prose toc-nav scrollbar-thin scrollbar-gutter-stable',
        className,
      )}
      {...rest}
    >
      {astChildren.map((child, index) => (
        <TocNode key={index} node={child} />
      ))}
    </nav>
  )
}

// ---- Link ----
function Link({
  href,
  children,
  className,
  ...rest
}: HtmlElementProps & { href?: string }) {
  const isExternal = href?.startsWith('http')
  return (
    <a
      href={href}
      className={cn(
        'font-medium text-primary underline underline-offset-4 hover:text-primary/80',
        className,
      )}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
      {...rest}
    >
      {children}
    </a>
  )
}

// ---- Inline code ----
function InlineCode({ children, className, ...rest }: HtmlElementProps) {
  return (
    <code
      className={cn(
        'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </code>
  )
}

// ---- Blockquote ----
function BlockQuote({ children, className, ...rest }: HtmlElementProps) {
  return (
    <blockquote
      className={cn(
        'mt-6 border-l-2 pl-6 italic text-muted-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </blockquote>
  )
}

// ---- List ----
function Ul({ children, className, ...rest }: HtmlElementProps) {
  return (
    <ul
      className={cn('my-3 ml-6 list-disc [&>li]:mt-1', className)}
      {...rest}
    >
      {children}
    </ul>
  )
}

function Ol({ children, className, ...rest }: HtmlElementProps) {
  return (
    <ol
      className={cn('my-3 ml-6 list-decimal [&>li]:mt-1', className)}
      {...rest}
    >
      {children}
    </ol>
  )
}

// ---- Table (for GFM tables) ----
function Table({ children, className, ...rest }: HtmlElementProps) {
  return (
    <div className="my-4 w-full overflow-x-auto">
      <table
        className={cn(
          'w-full border-collapse text-sm',
          className,
        )}
        {...rest}
      >
        {children}
      </table>
    </div>
  )
}

function Th({ children, className, ...rest }: HtmlElementProps) {
  return (
    <th
      className={cn(
        'border border-border px-4 py-2 text-left font-semibold bg-muted/50',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

function Td({ children, className, ...rest }: HtmlElementProps) {
  return (
    <td
      className={cn('border border-border px-4 py-2', className)}
      {...rest}
    >
      {children}
    </td>
  )
}

// ---- Image ----
function Img({ src, alt, className, ...rest }: HtmlElementProps & { src?: string; alt?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('my-4 max-w-full rounded-lg', className)}
      {...rest}
    />
  )
}

// ---- Paragraph ----
function P({ children, className, ...rest }: HtmlElementProps) {
  return (
    <p className={cn('leading-7 [&:not(:first-child)]:mt-4', className)} {...rest}>
      {children}
    </p>
  )
}

// ---- Horizontal Rule ----
function Hr({ className, ...rest }: HtmlElementProps) {
  return <hr className={cn('my-8 border-border', className)} {...rest} />
}

// ============================================================================
// Main MarkdownRenderer Component
// ============================================================================

function MarkdownRendererInner({
  source,
}: Omit<MarkdownRendererProps, 'docName' | 'className'>) {
  const { highlighter } = useShiki()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const components = useMemo<any>(
    () => ({
      h1: H1,
      h2: H2,
      h3: H3,
      h4: H4,
      h5: H5,
      h6: H6,
      pre: PreWithCopy,
      nav: TocNav,
      a: Link,
      code: InlineCode,
      blockquote: BlockQuote,
      ul: Ul,
      ol: Ol,
      table: Table,
      th: Th,
      td: Td,
      img: Img,
      p: P,
      hr: Hr,
    }),
    [],
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rehypePlugins: any[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const plugins: any[] = [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
        },
      ],
      [rehypeToc, REHYPE_TOC_OPTIONS],
    ]

    if (highlighter) {
      plugins.push([
        rehypeShikiFromHighlighter,
        highlighter,
        {
          themes: SHIKI_THEMES,
        },
      ])
    }

    return plugins
  }, [highlighter])

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={rehypePlugins}
      components={components}
    >
      {source}
    </ReactMarkdown>
  )
}

export default function MarkdownRenderer(props: MarkdownRendererProps) {
  const { source, docName } = props

  return (
    <ShikiProvider docName={docName}>
      <MarkdownRendererInner source={source} />
    </ShikiProvider>
  )
}

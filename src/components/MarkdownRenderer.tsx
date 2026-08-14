import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

export type MarkdownRendererProps = {
  source: string
}

const components: Record<string, any> = {
  h1: ({ children }: any) => <h1 className="text-3xl font-bold my-4">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-2xl font-semibold my-3">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-xl font-semibold my-2">{children}</h3>,
  p: ({ children }: any) => <p className="my-2 leading-relaxed">{children}</p>,
  a: ({ href, children }: any) => (
    <a href={href} className="text-blue-600 underline" target="_blank" rel="noreferrer">
      {children}
    </a>
  ),
  code: ({ inline, className, children }: any) => (
    <code className={inline ? 'px-1 rounded bg-gray-100' : `block p-3 rounded ${className || 'bg-gray-900 text-white'}`}>
      {children}
    </code>
  ),
  pre: ({ children }: any) => <div className="overflow-auto my-3">{children}</div>,
  img: ({ src, alt }: any) => <img src={src} alt={alt} className="max-w-full rounded" />,
  li: ({ children }: any) => <li className="ml-4 list-disc">{children}</li>,
  blockquote: ({ children }: any) => <blockquote className="border-l-4 pl-4 italic text-gray-600">{children}</blockquote>,
}

export default function MarkdownRenderer({ source }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight as any]}
      components={components}
      children={source}
    />
  )
}

import { createFileRoute } from '@tanstack/react-router'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import { getDocContent } from '@/lib/docs-functions'

export const Route = createFileRoute('/docs/$slug')({
  loader: async ({ params }) => {
    const slug = decodeURIComponent(params.slug)
    return getDocContent({ data: slug })
  },
  component: DocPage,
})

function DocPage() {
  const { content, frontmatter, docName } = Route.useLoaderData()

  if (!content) {
    return <div className="p-4 text-center text-muted-foreground">未找到该文档。</div>
  }

  return (
    <div className="doc-container flex w-full flex-row">
      <article className="prose dark:prose-invert min-w-0 max-w-full flex-1 px-4 py-0 md:px-16">
        {typeof frontmatter.title === 'string' && (
          <div className="mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">{frontmatter.title}</h1>
            {typeof frontmatter.date === 'string' && (
              <p className="mt-2 text-sm text-muted-foreground">{frontmatter.date}</p>
            )}
          </div>
        )}
        <MarkdownRenderer source={content} docName={docName} />
      </article>
      <div className="toc-holder shrink-0 w-[300px] hidden xl:block" aria-hidden="true" />
    </div>
  )
}

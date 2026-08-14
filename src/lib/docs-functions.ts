import { createServerFn } from '@tanstack/react-start'
import fs from 'fs'
import path from 'path'
import { walkDocsDir, shouldAccessedDoc, splitFrontmatter, type DocEntry } from '@/lib/server-utils'

export interface DocItem {
  name: string
  relativePath: string
  isDirectory: boolean
}

export interface DocContent {
  content: string
  frontmatter: Record<string, unknown>
  docName: string
}

/**
 * 从服务器本地 docs 目录读取文档列表（server fn，客户端导航时通过 RPC 调用）
 */
export const getDocsManifest = createServerFn().handler(async () => {
  const docsDir = path.resolve(process.cwd(), 'docs')
  const entries: DocEntry[] = walkDocsDir(docsDir).filter(
    (e) => shouldAccessedDoc(e.relativePath) || e.isDirectory,
  )

  const items: DocItem[] = entries.map((e) => ({
    name: e.name,
    relativePath: e.relativePath,
    isDirectory: e.isDirectory,
  }))

  return { items }
})

/**
 * 从服务器本地 docs 目录读取文档内容（server fn，客户端导航时通过 RPC 调用）
 */
export const getDocContent = createServerFn()
  .validator((docPath: string) => docPath)
  .handler(async ({ data }) => {
    const docPath = data
    const fullPath = path.resolve(process.cwd(), `docs/${docPath}.md`)

    const docsRoot = path.resolve(process.cwd(), 'docs')
    if (!fullPath.startsWith(docsRoot)) {
      throw new Error('Invalid path')
    }

    if (!fs.existsSync(fullPath)) {
      return { content: '', frontmatter: {}, docName: docPath }
    }

    const raw = fs.readFileSync(fullPath, 'utf-8')
    const { content, frontmatter } = splitFrontmatter(raw)

    return { content, frontmatter, docName: docPath }
  })

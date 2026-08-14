import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface DocEntry {
  name: string
  relativePath: string
  isDirectory: boolean
}

/**
 * 递归遍历 docs 文件夹，返回所有子项
 */
export function walkDocsDir(dirPath: string): DocEntry[] {
  const results: DocEntry[] = []
  const absolutePath = path.resolve(dirPath)

  if (!fs.existsSync(absolutePath)) {
    return results
  }

  function walk(currentPath: string) {
    const items = fs.readdirSync(currentPath, { withFileTypes: true })

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name)

      if (item.isDirectory()) {
        results.push({
          name: item.name,
          relativePath: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
          isDirectory: true,
        })
        walk(fullPath)
      } else if (item.isFile() && item.name.endsWith('.md')) {
        results.push({
          name: item.name,
          relativePath: path.relative(process.cwd(), fullPath).replace(/\\/g, '/'),
          isDirectory: false,
        })
      }
    }
  }

  walk(absolutePath)
  return results
}

/**
 * 过滤函数：是否应该包含该文档
 */
export function shouldAccessedDoc(relativePath: string): boolean {
  const normalizedPath = String(relativePath || '').replace(/\\/g, '/').replace(/^\.?\//, '')
  return normalizedPath.endsWith('.md')
}

/**
 * 解析 frontmatter
 */
export function splitFrontmatter(markdown: string) {
  if (typeof markdown !== 'string') {
    return { frontmatter: {} as Record<string, unknown>, content: '' }
  }

  const parsed = matter(markdown)
  return {
    frontmatter: parsed.data ?? {},
    content: parsed.content,
  }
}

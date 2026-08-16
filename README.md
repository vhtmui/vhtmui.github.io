# my_site

由 `my_svelte_site`（SvelteKit）迁移而来的 React 项目。

- 框架：**React 19 + Vite 8 + TanStack Router**（纯 JavaScript）
- Markdown 渲染：**react-markdown**（GFM、rehype-slug、rehype-toc、shiki 代码高亮、自定义代码块复制按钮 / 标题 / TOC 大纲）
- 样式：Tailwind CSS v4 + daisyui + shadcn 风格组件 + tw-animate-css
- 文档：`docs/` 目录结构与内容保持原样，构建时自动打包进站点

## 命令

```sh
pnpm install
pnpm dev        # 开发
pnpm build      # 构建到 build/
pnpm build:github   # DEPLOY_TARGET=github 构建（排除 docs/未整理的部分）
pnpm build:internal # DEPLOY_TARGET=internal 构建（排除 blogs 与未整理的部分）
pnpm preview    # 预览构建产物
```

## 部署

- 本地/内网：`local-deploy.bat`（scp 到服务器），或直接把 `build/` 目录发布到静态服务器。
- GitHub Pages：`.github/workflows/deploy.yaml` 会在推送 master 分支时构建并部署；
  构建时通过 `BASE_PATH` 环境变量支持子路径部署（例如 `/repo-name`）。
- 深链接（如 `/docs/xxx`）通过 `build/404.html`（即 index.html 副本）作为 SPA fallback 支持。

## 结构

```
src/
  lib/
    my-utils.js        # formatUrl / copyToClipboard / shouldAccessedDoc / useShortcut 等
    docs.js            # 构建时打包 docs 目录，生成文档树与内容
    theme.js           # 主题（light/dark/system），与 mode-watcher 存储兼容
    components/ui/     # shadcn 风格 UI 组件（button/sidebar/sheet/collapsible 等）
    components/my/     # Header / Navigator / ThemeToggle / CopyText / GlobalSidebar 等
  routes/
    root-layout.jsx    # 全局布局（顶栏 + 侧边栏）
    home.jsx           # 首页
    mac-converter.jsx  # MAC 地址转换器
    testpage.jsx       # 测试页
    not-found.jsx      # 404 错误页
    docs/              # 文档站（列表、catch-all 渲染、MyMarkdown 组件）
```

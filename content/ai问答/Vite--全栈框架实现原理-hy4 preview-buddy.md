# 基于 Vite 的全栈框架设计原理

> 主题：一份路由模块源码，如何被编译到 **client / server 两个环境**，并在 **dev → build → 部署 → 水合** 这条链路上被依次处理。
>
> 示例主要取自 React Router v7/v8（Framework Mode），同样的原理适用于 Remix、SvelteKit、Nuxt、SolidStart 等基于 Vite 的全栈框架。

## 阅读主线

全栈框架做的事，可以概括成一句话：

> **把同一份路由模块，按「代码该跑在哪一端」切开，编译成两份产物，再用一个统一的请求处理器把它们串起来。**

沿着开发者实际使用框架的顺序，这条链路是：

```
脚手架/约定  →  dev  →  路由与数据  →  两端代码切分  →  build  →  prerender  →  部署(适配器)  →  hydrate
   (输入)     (开发)     (核心抽象)      (编译期难点)     (构建)     (构建期末尾)     (运行时)        (运行时)
```

其中 **第 3、4 章是全栈框架真正的难点**，dev / build / 部署都只是围绕它们服务的基础设施。

---

## 0. 先划清边界：Vite 给什么，框架补什么

Vite 本身**不是**全栈框架。它只提供三样东西：环境抽象、构建引擎、开发服务器。剩下的全是框架补的。

| 能力 | Vite 是否提供 | 由谁提供 |
| --- | --- | --- |
| 按环境（client / ssr / edge）解析与打包 | 是（Environment API） | Vite |
| 开发服务器 + HMR | 是 | Vite |
| 代码分割、Tree Shaking | 是（Rollup / Rolldown） | Vite |
| 路由约定、文件路由 | 否 | 框架 |
| 数据加载（loader / action） | 否 | 框架 |
| 服务端渲染、流式输出 | 否 | 框架（Vite 只提供 `ssrLoadModule` 这类底层 API） |
| 预渲染 / SSG | 否 | 框架（在 build 之后自己跑一遍） |
| 部署适配器 | 否 | 框架 |
| 类型生成 | 否 | 框架 |

所以一个基于 Vite 的全栈框架，本质是**四件套**：

| 组成 | 职责 | 代表 |
| --- | --- | --- |
| 1. Vite 插件（编译期） | 注入虚拟模块、生成路由清单、剔除服务端导出、编排 client/server 构建、注入 dev 中间件 | `@react-router/dev/vite` |
| 2. 运行时（运行时） | 服务端渲染器、客户端水合器、`createRequestHandler`、数据序列化协议 | `react-router` |
| 3. CLI | `dev` / `build` / `typegen` / `reveal` | `@react-router/dev` |
| 4. 适配器 | 平台请求 ⇄ Web Fetch API 的转换、平台上下文注入 | `@react-router/{express,node,cloudflare}` |

**关键洞察：框架生成的是「请求处理器（handler）」，而不是「Web 服务器」。** 这是理解后面所有内容的前提——正因为它只产出 `(Request) => Response`，同一份应用才能跑在 Express、Node http、Cloudflare Workers、Lambda 上。

---

## 1. 输入：脚手架与项目约定

框架第一件事是定义「你按什么写」，因为**只有在编译期能被静态分析的结构，框架才能改写**。

```
app/
├── root.tsx              # 根布局，同时被两端使用（含 <html> 骨架与资源占位）
├── routes.ts             # 路由配置（也可用 flat routes 文件约定）
├── entry.client.tsx      # 浏览器入口：水合
├── entry.server.tsx      # 服务端入口：渲染成 HTML 流
├── routes/
│   ├── _index.tsx
│   └── blog.$slug.tsx
└── utils/
    ├── db.server.ts      # 只进服务端包
    └── analytics.client.ts # 只进客户端包
react-router.config.ts    # 框架层配置
vite.config.ts            # Vite 层配置
```

| 文件 | 作用 | 属于哪一端 |
| --- | --- | --- |
| `root.tsx` | 文档骨架 + 全局布局 | 两端（导出会被切分） |
| `routes.ts` | 路由树定义 | 编译期消费，产出清单 |
| `entry.server.tsx` | 把渲染结果变成 HTTP 响应 | 仅服务端 |
| `entry.client.tsx` | `hydrateRoot` 接管 DOM | 仅客户端 |
| `react-router.config.ts` | `ssr` / `prerender` / `buildDirectory` / `serverModuleFormat` 等 | 编译期 |

> 这几个入口文件默认不落盘，框架在内部提供默认实现；想改就执行 `react-router reveal` 把它们「吐」到 `app/` 里。

---

## 2. dev：开发服务器是怎么跑起来的

### 2.1 Vite 的中间件模式

开发时**不打包**。Vite 以中间件模式启动，由框架接管未匹配的请求：

```ts
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: 'custom', // 关掉 Vite 自己的 HTML 服务逻辑
})
app.use(vite.middlewares) // 静态资源、HMR、依赖预构建
app.use('*', ssrHandler)   // 框架自己的 SSR 中间件（必须用 post 钩子，排在后面）
```

框架由此有两种 dev 形态：

| 形态 | 启动方式 | 说明 |
| --- | --- | --- |
| 框架自带 | `react-router dev` | CLI 内部起 Vite dev server，SSR 逻辑由插件注入 |
| 自定义服务器 | `node server.js`（`NODE_ENV=development` + `--conditions development`） | 你自己的 Express 里挂 Vite 中间件，dev / prod 共用同一份 server 代码 |

### 2.2 两套模块图与 `ssrLoadModule`

dev 下 Vite 维护**两份独立的模块图**（client、ssr），同一份源码会被变换两次：

```ts
// 客户端：由浏览器 import，走 /src/... 的 ESM 请求
// 服务端：由 Vite 在 Node 进程内按需编译并求值
const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
```

`ssrLoadModule` 把 ESM 源码即时转成 Node 可执行的形式，**不打包、不落盘**，并带缓存失效（类似 HMR）。

### 2.3 虚拟模块：dev 与 build 的公共接口

框架用虚拟模块把「生成出来的代码」接进模块图，这样 dev（按需编译）和 build（Rollup 打包）走的是**同一套源码**：

| 虚拟模块 | 内容 |
| --- | --- |
| `virtual:react-router/server-build` | 服务端构建入口：聚合所有路由模块，导出 `ServerBuild`（路由树、资源清单、basename 等） |
| `virtual:react-router/server-manifest` | 路由元数据 + 资源信息的清单 |
| `virtual:react-router/browser-manifest` | 给浏览器用的路由清单 |
| `virtual:react-router/hmr-runtime` | React Fast Refresh 运行时 |

这就是为什么你的 `server/app.ts` 可以写成一份代码同时服务 dev 和 prod：

```ts
app.use(
  createRequestHandler({
    build: () => import('virtual:react-router/server-build'),
  }),
)
```

dev 时它解析到内存里的模块图，prod 时解析到 `build/server/index.js`。

### 2.4 dev 下一次文档请求的完整链路

```
① 浏览器请求 /blog/hello
② Vite 中间件处理静态资源与 HMR；未命中则交给框架中间件
③ 把 Node 的 req/res 转成标准 Request（框架内部适配器）
④ 加载 virtual:react-router/server-build（ssrLoadModule 按需编译）
⑤ 路由匹配 → 并行执行 loader → 渲染成 HTML 流
⑥ 读取 index.html 模板 → vite.transformIndexHtml 注入 HMR client
⑦ 把渲染结果替换掉占位符，返回 HTML
⑧ 浏览器加载 /@vite/client 与 entry.client.tsx，水合并建立 HMR 连接
```

HMR 之外，框架还额外提供了 **HDR（Hot Data Reload）**：改 `loader` / `action` 时重新取数，而不是整页刷新。

> Vite 6 起这些概念被正式化为 **Environment API**：dev 下一个服务器可同时驱动多个环境（client / ssr / edge），每个环境有独立模块图与模块运行器（Module Runner）。Cloudflare 的 Vite 插件就利用它在本地用 workerd（miniflare）跑服务端代码，让 dev 尽量贴近 prod。该 API 目前处于 RC 阶段。

---

## 3. 核心抽象：路由模块与 loader / action

这是全栈框架最核心的设计：**一个路由模块，既是页面，也是接口**。

```tsx
// app/routes/blog.$slug.tsx
export async function loader({ params }: Route.LoaderArgs) {
  const post = await db.post.findUnique({ where: { slug: params.slug } })
  return { post }            // 只返回可序列化的数据
}

export default function Post({ loaderData }: Route.ComponentProps) {
  return <article>{loaderData.post.title}</article>
}
```

`loader` 的三种执行时机：

| 场景 | 运行位置 | 说明 |
| --- | --- | --- |
| 首次访问（SSR） | Node 服务端 | 与渲染同进程，直接函数调用，无 HTTP 往返 |
| 预渲染（SSG） | Node（构建时） | 结果被存成静态文件 |
| 客户端导航 | 仍是服务端 | 浏览器发 `.data` 请求，服务端再跑一次 loader |

**结论：`loader` 永远不在浏览器里执行。** 它从客户端包中被移除（见第 4 章），客户端只能通过 HTTP 拿到它的执行结果。

### 文档请求 vs 数据请求

框架把请求分成两类，这是理解数据流的钥匙：

| 请求类型 | URL 形态 | 返回 |
| --- | --- | --- |
| 文档请求 | `/blog/hello` | 完整 HTML |
| 数据请求 | `/blog/hello.data?_routes=root,routes/blog.$slug` | 序列化的 loader 结果 |

客户端导航时只发第二种请求（Single Fetch：一次请求取回该次导航涉及的所有路由数据），`_routes` 指明需要哪些路由的 loader。

---

## 4. 编译期难点：一份代码如何切成两端

### 4.1 为什么要切

| 原因 | 切不干净的后果 |
| --- | --- |
| 体积 | 服务端专用的 ORM、markdown 解析器被打进浏览器包 |
| 安全 | 数据库凭证、密钥被打进浏览器包 |
| 环境能力 | 浏览器里没有 `node:fs`，服务端没有 `window` |

### 4.2 机制一：路由模块的导出剔除（主力）

框架插件在**客户端构建**时，把路由模块里服务端专用的导出直接删掉：

```
loader / action / headers  →  从客户端包中移除
default（组件）/ clientLoader / clientAction / ErrorBoundary / links / meta  →  保留
```

这发生在编译期，是**确定性的删除**，不是靠摇树碰运气。

注意它剔除的只是**导出本身**：如果路由模块顶层 `import` 了一个服务端模块，而这个 import 只被 `loader` 使用，那么它大概率会被 Tree Shaking 掉，但**这是优化结果、不是保证**。想要确定性地排除，必须用下一节的 `.server` 约定。

### 4.3 机制二：`.server` / `.client` 模块约定（硬保证）

对于**非路由模块**，用文件名/目录名显式声明归属：

```
app/
├── utils.server.ts      # 或 .server/ 目录
├── analytics.client.ts  # 或 .client/ 目录
```

| 约定 | 行为 | 违反时 |
| --- | --- | --- |
| `.server` | 完全排除出客户端包 | **构建直接报错**（一旦它进了客户端模块图） |
| `.client` | 排除出服务端包 | 服务端上该模块的导出值为 `undefined` |

注意点：

- 路由模块**不能**标成 `.server` 或 `.client`——它需要被两端引用，有特殊处理，标注会导致构建错误。
- 从 `.client` 模块导出的值在服务端是 `undefined`，因此只能在 `useEffect`、事件回调里使用，不能在渲染期读取。

### 4.4 机制三：`import.meta.env.SSR` 静态替换 + Tree Shaking（只能用于优化）

```ts
if (import.meta.env.SSR) {
  const fs = await import('node:fs')
  // ...
}
```

Vite 在构建时把 `import.meta.env.SSR` 静态替换成 `true` / `false`，死分支随之被摇掉。

> **重要原则：不要把 Tree Shaking 当作「移除服务端代码」的正确性保证，它只能当作体积优化。** 摇不掉就是密钥泄漏或运行时崩溃，正确性问题必须交给机制一、机制二这种确定性删除。需要更细粒度控制时，用 `vite-env-only` 这类插件提供的 `serverOnly$()` / `clientOnly$()`。

### 4.5 机制四：依赖解析差异

两端打包对第三方依赖的处理完全不同：

| 配置 | 作用 |
| --- | --- |
| 默认：依赖外部化（external） | 服务端构建不打包 `node_modules`，直接 `import`，dev 和 build 都更快 |
| `ssr.noExternal` | 需要被 Vite 流水线处理的依赖（比如源码里用了 Vite 专有语法） |
| `ssr.external` | 强制外部化（link 依赖默认不外部化，为了 HMR） |
| `ssr.target: 'webworker'` | 按 Worker 运行时解析包入口 |
| `ssr.resolve.conditions` | 自定义包的条件导出（如 `node` / `browser` / `workerd`） |

同一份源码能同时适配两端，很大程度上依赖 npm 包的**条件导出**：

```json
{
  "exports": {
    "browser": "./dist/browser.js",
    "node": "./dist/node.js",
    "workerd": "./dist/worker.js",
    "default": "./dist/index.js"
  }
}
```

---

## 5. build：生产构建做了什么

### 5.1 两次构建，且有顺序

```
react-router build
  ├─ ① client build  →  build/client/        浏览器产物 + 资源清单
  ├─ ② server build  →  build/server/index.js  Node 可执行的服务端构建
  └─ ③ prerender     →  build/client/*.html / *.data（可选，见第 6 章）
```

**为什么必须先 client 后 server**：服务端渲染时需要把 client 构建产出的 `<script>` / `<link>` 标签（以及按需路由的 preload 指令）注入 HTML。这个信息只能等 client 构建完才有。

在 Vite 配置里区分两次构建：

```ts
export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild ? { input: './server/app.ts' } : undefined,
  },
  plugins: [reactRouter()],
}))
```

### 5.2 产物结构

| 目录 | 内容 | 谁用 |
| --- | --- | --- |
| `build/client/` | JS / CSS / 图片 / 预渲染 HTML / `.data` | 浏览器、CDN、静态托管 |
| `build/server/` | `index.js`（默认 ESM，可配 `serverModuleFormat: 'cjs'`） | 你的服务器或适配器 |

目录名默认是 `build/`（可用 `buildDirectory` 改），服务端产物文件名默认是 `index.js`（可用 `serverBuildFile` 改）。

### 5.3 三份清单，各管一段

| 清单 | 产出方 | 用途 |
| --- | --- | --- |
| Vite/Rollup manifest | client 构建 | 模块 → 产物文件的映射 |
| SSR manifest（`--ssrManifest`） | client 构建 | 模块 ID → chunk/asset，用于在服务端生成 preload 指令 |
| 框架路由清单（虚拟模块） | 框架插件 | 路由元数据，供服务端渲染与客户端路由发现使用 |

注意 SSR manifest 是**由 client 构建产出**的——因为要建立「模块 ID → 客户端文件」的映射。

### 5.4 进阶：多服务端包与环境 API

- `serverBundles`：按路由分支把服务端拆成多个 bundle，不同路由部署到不同目标（如一部分上 Lambda，一部分跑长驻服务器）。
- 开启 `v8_viteEnvironmentApi`（需 Vite 6+）后，构建走**单次 `builder.buildApp()` 编排多个环境**（`client` / `ssr` / `ssrBundle_[id]`），取代两次独立 `vite build`。
- `ssr: false`（SPA 模式）时**直接跳过 server build**，只产出一个 `index.html`。

---

## 6. prerender：把运行时的事挪到构建时

### 6.1 时机与原理

预渲染发生在**两份产物都出来之后**。它不需要任何新的应用 API，用的就是 SSR 那套：

> 框架自己 `new Request(path)`，把它送进同一个请求处理器，跑路由匹配、跑 loader、渲染组件，然后把结果写成文件。

### 6.2 配置

```ts
// react-router.config.ts
export default {
  // 形态一：静态数组
  prerender: ['/', '/about'],

  // 形态二：函数（可用 getStaticPaths() 拿到所有静态路径）
  // prerender: async ({ getStaticPaths }) => [
  //   ...getStaticPaths(),
  //   ...(await getSlugsFromCMS()).map((s) => `/blog/${s}`),
  // ],

  // 形态三：带并发（默认 1，即串行）
  // prerender: { paths: ['/', '/about'], concurrency: 4 },
} satisfies Config
```

注意：`prerender: true` 只会预渲染**静态路径**，动态段（如 `/blog/:slug`）参数未知，不会包含。

### 6.3 产物

每个被预渲染的路径产出**两个文件**：

| 文件 | 用途 |
| --- | --- |
| `[url].html` | 首次文档请求 |
| `[url].data` | 客户端导航时的数据请求 |

```
Prerender: Generated build/client/index.html
Prerender: Generated build/client/blog/my-first-post.data
Prerender: Generated build/client/blog/my-first-post/index.html
```

### 6.4 与 `ssr` 的组合（四种渲染策略）

| `ssr` | `prerender` | 结果 |
| --- | --- | --- |
| `true`（默认） | 不配 | 纯 SSR，全部运行时渲染 |
| `true` | 配 | SSR 服务器 + 部分路径用静态文件加速 |
| `false` | 配 | 纯静态托管；预渲染路径可以有 loader，但**不能有 `action` / `headers`**（没有运行时服务器执行它们） |
| `false` | 不配 | **SPA 模式**：只渲染根路由到一个 `index.html`，只有根路由能有 loader |

`ssr: false` + 部分预渲染时，框架还会产出一个 **SPA fallback** 文件给未预渲染的路径兜底：

- `/` 未预渲染 → `build/client/index.html`
- `/` 已预渲染 → `build/client/__spa-fallback.html`

需要在托管平台上把 404 回退到该文件。

### 6.5 SSG 的本质

> **SSG = 把「运行时调用后端取数」变成「构建时取一次数存成快照，运行时请求预生成的 `.data` 文件」。**

客户端包本身与 SSR 模式**完全相同**，区别只在于数据从哪来：SSR 是打到服务端执行 loader，SSG 是读取构建时写好的静态文件。

---

## 7. 部署：适配器与请求处理器

### 7.1 统一契约：Fetch API

框架的核心处理器基于 Web 标准：

```
(Request, ...platformContext) => Promise<Response>
```

适配器只做两件事：

1. **协议转换**：把平台原生的请求/响应转成标准 `Request` / `Response`
2. **上下文注入**：把平台能力（如 `req.user`、Cloudflare 的 `env` / `ctx`）传给 loader / action

```ts
// Express（@react-router/express）
import { createRequestHandler } from '@react-router/express'
app.all('*', createRequestHandler({
  build: () => import('virtual:react-router/server-build'),
  getLoadContext(req, res) { return {} },   // 注入到 loader 的 context
}))

// 原生 Node（@react-router/node）
import { createRequestListener } from '@react-router/node'
http.createServer(createRequestListener(() => import('./build/server/index.js')))

// Cloudflare Workers（无 Node 服务器，直接用 react-router 的 handler）
const requestHandler = createRequestHandler(
  () => import('virtual:react-router/server-build'),
  import.meta.env.MODE,
)
export default {
  fetch(request, env, ctx) {
    const routerContext = new RouterContextProvider()
    routerContext.set(cloudflareContext, { env, ctx })
    return requestHandler(request, routerContext)
  },
}
```

若不需要自定义服务器，可直接使用官方的 `@react-router/serve`，这时你完全不接触适配器 API。

### 7.2 部署形态一览

| 渲染策略 | 运行时依赖 | 部署目标 |
| --- | --- | --- |
| SSR | 需要跑 `build/server/index.js` 的 JS 运行时 | Express / Node / Cloudflare Workers / Lambda / Deno |
| SSG（`ssr:false` + prerender） | 只需静态文件服务 | 任意静态托管、CDN |
| SPA | 只需静态文件服务 + 404 回退 | 任意静态托管 |

---

## 8. hydrate：客户端如何接管

1. 服务端把 loader 的结果**序列化后内联进 HTML**（作为一个框架全局上下文对象）。
2. 浏览器加载 `entry.client.tsx`，用**同样的路由模块**执行 `hydrateRoot`（RR 中是 `<HydratedRouter>`）。
3. 因为客户端包里没有 `loader`，且数据已内联，**首屏不会重复取数**。
4. 之后的客户端导航：按路由懒加载对应 chunk，并发一个 `.data?_routes=...` 请求拿数据。

配套优化是**懒路由发现**（默认 `routeDiscovery.mode: 'lazy'`）：首屏只下发当前匹配路由的信息，导航到新路由时再向 `/__manifest` 请求该分支的路由定义，从而减小首屏清单体积。

---

## 9. 全景图

```
                       你的源码（路由模块）
                               |
             [ 框架 Vite 插件：编译期改写 ]
             · 剔除 loader / action / headers
             · .server / .client 模块隔离
             · import.meta.env.SSR 静态替换
                               |
              ┌────────────────┴────────────────┐
       client 环境                           ssr 环境
              |                                  |
   dev:   浏览器直接 import            dev:   ssrLoadModule / Module Runner
   build: Rollup 打包                  build: Rollup 打包（依赖外部化）
              |                                  |
      build/client/                      build/server/index.js
      JS / CSS / 清单                     ServerBuild
              |                                  |
              |          ③ prerender：构造 Request 走一遍 handler
              |             → *.html + *.data
              └────────────────┬────────────────┘
                               v
        ④ 部署：适配器把平台请求转成 Fetch API → createRequestHandler
                               |
                               v
        ⑤ 浏览器：hydrate（数据已内联）→ 后续导航走 .data 请求
```

### 命令 → 实际发生了什么

| 命令 | 关键动作 |
| --- | --- |
| `react-router dev` | 起 Vite dev server → 注入 SSR 中间件 → 按需编译双模块图 → HMR/HDR |
| `react-router build` | ① client build → ② server build（`isSsrBuild`）→ ③ prerender（可选）→ `buildEnd` 钩子 |
| `react-router typegen` | 生成 `.react-router/types`，为每个路由提供 `Route.LoaderArgs` 等类型 |
| `react-router reveal` | 把默认入口文件复制到 `app/` 以便自定义 |
| `react-router-serve` | 官方 Node 服务器，直接加载 `build/server` |

---

## 10. 常见误解勘误

| 误解 | 正确说法 |
| --- | --- |
| 框架会生成一个 Web 服务器 | 框架产出**请求处理器**；服务器是你选的（Express / Node / Workers），或用官方的 `@react-router/serve` |
| `loader.server.ts` 这种写法是通用约定 | 错。`loader` 由插件自动从客户端包剔除；`*.server.ts` 只用于**普通模块**，且**路由模块不能**加 `.server` / `.client` |
| 靠 Tree Shaking 就能保证服务端代码不下发 | 错。Tree Shaking 只能当体积优化，「确定性删除」靠导出剔除与 `.server` 约定 |
| 客户端导航时 `loader` 在浏览器里跑 | 错。`loader` 只在服务端跑，客户端发 `.data` 请求拿结果 |
| SSR 与 SSG 的客户端包不一样 | 错。核心 JS 包相同，SSG 只是额外产出预渲染 HTML 与 `.data` 快照 |
| SSG 预渲染是 Vite 干的 | 错。Vite 只提供构建能力，预渲染由框架在两次构建之后执行 |
| 服务端构建一定和客户端构建一样要打包依赖 | 不一定。SSR 依赖默认外部化，`noExternal` 才会打包进去；Worker 场景常需打包成单文件 |
| 默认产物目录是 `dist/` | React Router 默认是 `build/`（`build/client` + `build/server`），可用 `buildDirectory` 改 |
| `ssr: false` 就是静态站点 | 不完全。`ssr:false` + 不配 `prerender` 是 SPA 模式，只有根路由能有 loader |

---

## 11. 延伸阅读

- [Vite SSR 官方指南](https://vite.dev/guide/ssr)
- [Vite Environment API](https://vite.dev/guide/api-environment)
- [React Router · Pre-Rendering](https://reactrouter.com/how-to/pre-rendering)
- [React Router · `.server` modules / `.client` modules](https://reactrouter.com/api/framework-conventions/server-modules)
- [React Router · `@react-router/{adapter}`](https://reactrouter.com/api/other-api/adapter)
- [React Router · Lazy Route Discovery](https://reactrouter.com/explanation/lazy-route-discovery)

---

*主线：一份源码 → 两端编译 → dev 按需求值 → build 产出双产物 → 构建期末尾预渲染 → 适配器接入运行时 → 浏览器水合接管。*

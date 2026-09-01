# 基于 Vite 的全栈框架工作原理

> 一句话总览：框架本质是一个 **Web 标准的请求处理器**（`Request → Response`）。
> 开发时以中间件挂进 Vite 开发服务器；构建时由 Vite 执行双构建；
> 构建后由适配器桥接到目标平台；SSG 则是在构建完成后于 Node 进程内
> 模拟请求、渲染并保存静态快照。

按生命周期分为五层，依次是：**① 开发者编写 → ② 开发时运行 → ③ 构建时 →
④ 构建后桥接 → ⑤ SSG 预渲染**。

---

## 一、开发侧：你写下的代码如何变成路由

路由是全栈框架控制请求的第一道关口。主流框架有两种声明风格，
但**底层殊途同归**。

### 1.1 配置路由（React Router v7 / TanStack Router 风格）

路由与文件位置解耦，集中声明：

```typescript
// app/routes.ts —— 显式配置
import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),                        // /
  route('blog/:slug', 'routes/blog.$slug.tsx', [   // /blog/:slug
    index('routes/blog.index.tsx'),
  ]),
] satisfies RouteConfig;
```

### 1.2 文件路由（SvelteKit / Nuxt / Astro 风格）

约定优于配置，目录结构即路由树：

```
src/routes/
├── page.tsx                 →  /
├── blog/
│   ├── page.tsx             →  /blog
│   └── [slug]/
│       └── page.tsx         →  /blog/:slug
└── (marketing)/             →  路由组：只分组，不产生路径段
    └── about/page.tsx       →  /about
```

文件名中的 `[slug]`、`[...slug]`（通配）等约定，会被编译成路由模式。

### 1.3 异同对比

| 维度 | 配置路由 | 文件路由 |
| ------ | ------ | ------ |
| 声明位置 | 集中式 `routes.ts` | 分散在目录结构中 |
| 路径来源 | 手写字符串 | 文件名/目录名推导 |
| 灵活性 | 高：一个组件可挂多个路径 | 低：结构与路径强绑定 |
| 心智负担 | 需维护映射关系 | "放对位置就生效" |
| 类型安全 | 框架扫描后生成类型（`.react-router/types`） | 同样由框架生成类型 |
| 典型框架 | React Router v7、TanStack Router | SvelteKit、Nuxt、Astro |

### 1.4 底层统一：一切都编译成"路由模块"

无论哪种风格，框架的 Vite 插件都会在**开发时和构建时**把它们归一化为
同一份路由配置数据，再通过**虚拟模块**注入业务代码：

```typescript
// 框架插件内部（概念伪代码）
function resolveRoutes() {
  if (config.style === 'file') {
    // 文件路由：扫描目录，把文件名编译成路由模式
    return scanDir('src/routes').map(file => ({
      pattern: filenameToPattern(file),  // blog/[slug]/page.tsx → '/blog/:slug'
      module: () => import(file),        // 懒加载路由组件
    }));
  }
  // 配置路由：直接读取用户配置
  return loadConfig('app/routes.ts');
}

// 注册虚拟模块，业务侧统一 import { routes } from 'virtual:framework/routes'
```

请求到达后的匹配过程（两种风格完全相同）：

```typescript
// 路由匹配：模式 → 正则，逐层匹配 URL
const compiled = routes.map(r => ({
  ...r,
  regex: compilePattern(r.pattern),  // '/blog/:slug' → /^\/blog\/([^/]+)$/
}));

function matchRoutes(pathname: string) {
  for (const r of compiled) {
    const m = pathname.match(r.regex);
    if (m) return { route: r, params: extractParams(r, m) };
    //                       → { slug: 'hello' }
  }
  return null; // 404
}
```

> 关键结论：**文件路由只是"把配置的路由前置到了文件系统约定"**，
> 进入框架运行时后，两者是同一份数据结构。

---

## 二、开发时：中间件拦截（仅 dev 有效）

开发模式下框架不打包，把自己的 SSR 逻辑以**中间件**挂进 Vite 开发服务器：

```javascript
// 概念伪代码
const vite = await createServer({ appType: 'custom' });

app.use(vite.middlewares);            // 1. Vite 原生：静态资源、HMR
app.use(async (req, res, next) => {   // 2. 框架：接管页面请求
  const build = await vite.ssrLoadModule('virtual:framework/server');
  //      ↑ 按需编译，源码改动即时生效（无全量打包）
  const { routes } = await vite.ssrLoadModule('virtual:framework/routes');
  const match = matchRoutes(req.url);          // ← 第一章的路由匹配在这里发生
  if (!match) return next();                   // 未命中，交给后续中间件
  const data = await runLoaders(match, req);   // 执行 loader 取数
  res.end(renderToHtml(match, data));          // SSR 渲染并返回
});
```

> 修正点：中间件拦截是**开发体验方案**。生产环境没有 Vite 开发服务器，
> 请求直达真实服务器（见第四章）。

---

## 三、构建时：Vite 双构建

`pnpm build` 触发两次独立构建，产出两份产物：

| 目标 | 输出 | 内容 |
| ------ | ------ | ------ |
| client | `build/client/` | 浏览器 JS/CSS（带 hash，供 Hydration） |
| server | `build/server/index.js` | 导出请求处理器的 Node 模块 |

```typescript
// vite.config.ts —— 框架插件自动展开为（概念示意）
export default {
  environments: {
    client: { resolve: { conditions: ['browser'] } },
    ssr:    { resolve: { conditions: ['node'] },
              external: ['node:fs', 'node:path'] },  // 服务端依赖不打包
  },
};
```

同一份源码进两个环境，靠三层机制隔离：

```typescript
if (import.meta.env.SSR) {           // 构建时静态替换为 true/false
  const fs = await import('node:fs'); // 客户端构建中此分支被整体剔除
}
```

| 机制 | 作用 |
| ------ | ------ |
| `*.server.ts` 文件约定 | 强制排除出客户端构建 |
| `import.meta.env.SSR` 条件剔除 | 死分支在压缩阶段被移除 |
| Tree Shaking | 未引用的服务端代码不进客户端包 |

---

## 四、构建后：SSR 产物的实现与适配器

### 4.1 SSR 产物：一个可调用的函数，而非服务器

第三章 server 构建产出的 `build/server/index.js`，就是 SSR 能力的载体。
它的实现方式值得展开，因为**它决定了本章适配器和第五章 SSG 的一切**。

**入口是渲染函数，不是服务器程序。** 服务端构建的输入是一个
`entry-server` 入口，它不监听端口、不含任何服务器代码，只导出一个
Web 标准的请求处理器：

```typescript
// src/entry-server.tsx —— 框架生成的服务端入口（概念示意）
import { createRequestHandler } from 'framework';

export const handler = createRequestHandler({
  routes,                                     // 第一章：归一化后的路由配置
  runLoaders,                                 // 渲染前服务端取数
  render: (App) => renderToString(<App />),   // SSR 渲染器
  serialize: (data) => inlineScript(data),    // 数据内联进 HTML（供 Hydration）
});
// handler: (Request) => Promise<Response> —— 纯函数，无 IO 副作用
```

**Vite 的 SSR 构建负责把它变成可加载的模块。** `--ssr` 构建
（环境 API 的 ssr 环境）打包这个入口时有两个关键设置：

| 设置 | 目的 |
| ------ | ------ |
| 运行时条件 `node` | 产物在 Node（或边缘运行时）中可执行 |
| `node:fs` 等内置模块 external | 不打进 bundle，运行时由宿主环境提供 |

这里正是 Vite 与全栈框架的分界：**Vite 提供"把服务端代码打包成模块"
的构建能力；而模块内部的路由匹配、loader、渲染与数据内联，全部是框架
注入 entry-server 的内容**（即第一~三章讲的）。不用框架时，这些需按
Vite 官方 [SSR 指南](https://vitejs.dev/guide/ssr)手写。

**关键设计推论："产物是函数而非进程"。** 正因为产物只是一个可调用的
函数、不绑定任何运行环境，同一份产物才有两种消费方式：

```
build/server/index.js —— 导出 handler(Request) → Response
   │
   ├── 消费方式一：适配器把它挂到真实服务器
   │     → 每个到达的请求实时渲染 → SSR 部署（本章 4.2）
   │
   └── 消费方式二：构建机的 Node 进程内直接调用
         → 对每个预声明路径渲染一次并保存 → SSG 预渲染（第五章）
```

### 4.2 适配器：桥接层，不是"打包器"

产物既然只是函数，谁来监听端口、接收请求？答案是**部署方选择的服务器**。
适配器（Adapter）的工作就是**格式转换与挂载**——把处理器接到具体平台上：

```javascript
// Express 适配器（概念伪代码）
async (req, res) => {
  const request  = new Request(req.url, { method: req.method }); // req → Request
  const response = await handler(request);                       // 调用处理器
  res.status(response.status).send(await response.text());       // Response → res
};

// Cloudflare Workers 适配器：平台原生就是 Fetch API，几乎零转换
export default { fetch: handler };
```

| 部署目标 | 适配方式 |
| --------- | --------- |
| Node（Express/Fastify） | req/res ↔ Request/Response 双向转换 |
| Cloudflare Workers | 原生 Fetch API，直通 |
| Vercel / Netlify | preset 生成 Serverless 函数入口 |
| 纯静态托管 | 无需适配器 → 走 SSG（第五章） |

> 修正点：以 React Router v7 为例，适配器不做"打包"。
> （例外：SvelteKit 的 adapter 会对产物二次打包，Nuxt 的 Nitro 是独立打包器，
> 但那属于特定框架的实现选择，不是通用原理。）

适配器是消费方式一：处理器**被挂载**，为每个到达的请求实时渲染。
而 4.1 说的消费方式二——**不挂载、在构建机的 Node 进程内直接调用处理器**——
就是第五章 SSG 的全部秘密：连一台 HTTP 服务器都不用启动。

---

## 五、SSG：构建后的预渲染步骤

SSG 是**双构建完成之后**的独立阶段，即 4.1 的**消费方式二**：产物既然是
纯函数，预渲染器就无需启动任何 HTTP 服务器，直接在 Node 进程内
`import` 它、**模拟请求**、渲染并保存快照，最后与客户端产物合并。

```typescript
// 概念伪代码：框架的预渲染器
const serverEntry = await import('./build/server/index.js'); // ← 上一步的产物

for (const path of await getPrerenderPaths()) {   // '/', '/blog/a', '/blog/b'...
  const request  = new Request(`http://localhost${path}`);
  const response = await serverEntry.handler(request); // 与线上完全相同的处理器

  await writeFile(`build/client${path}.html`, await response.text());
  //                          ↑ HTML 快照（含内联的 loader 数据）

  await writeFile(`build/client${path}.data`, serialize(loaderData));
  //                          ↑ 数据快照：客户端导航时 fetch 这个静态文件
}

// 最终产物：纯静态，直接上传 CDN，无需任何服务器
```

| 对比项 | SSR | SSG |
| ------ | ----- | ----- |
| HTML 生成时机 | 运行时，每个请求 | 构建时，每个路由一次 |
| loader 执行位置 | 线上服务器 | 构建机的 Node 进程 |
| 客户端导航 | fetch 接口 → 服务端实时执行 loader | fetch 静态 `.data` 文件 |
| 需要服务器 | 需要 | 不需要，CDN 即可 |

> 修正点：不是"抓取数据"，而是**主动模拟请求 → 渲染 → 保存结果**。
> （SvelteKit 额外内置爬虫，从已渲染 HTML 中发现新链接继续渲染，
> 属于路由来源的扩展，不改变本质。）

---

## 六、总时间线

```
开发编码        文件路由 / 配置路由 / loader / import.meta.env.SSR
   │
pnpm dev        Vite 中间件拦截请求 → 按需编译 → SSR（无打包）
   │
pnpm build      Vite 双构建 → client 产物 + server 产物（请求处理器）
   │
   ├── SSR 部署：适配器桥接 → 挂到 Express / Workers / Serverless
   │
   └── SSG：Node 内模拟请求 → 渲染 HTML + 保存 .data → 纯静态产物
```

---

## 七、拓展：Vite + 路由库（SPA 模式）≠ 全栈框架

另一种常见形态：**项目以 Vite 官方模板为基座，额外安装
`react-router-dom` / `vue-router` 等路由库**。它和全栈框架虽共用 Vite，
但架构上处于完全不同的层次。

### 7.1 典型形态

```bash
npm create vite@latest my-app -- --template react
npm install react-router-dom        # 路由库：只是一个普通运行时依赖
```

```tsx
// src/main.tsx —— 路由在浏览器里由组件树驱动
import { BrowserRouter, Routes, Route } from 'react-router-dom';

createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog/:slug" element={<Blog />} />
    </Routes>
  </BrowserRouter>
);
```

```typescript
// vite.config.ts —— 几乎为零配置
export default defineConfig({
  plugins: [react()],
  // appType: 'spa'（默认）：Vite 自带 history fallback
});
```

### 7.2 关键差异：路由发生在哪里

这是两种模式的分水岭：

```
SPA 模式：   浏览器 ──请求──► 服务器（只回 index.html）
                              浏览器收到 HTML 后，路由库读取 URL，
                              在客户端切换组件 ← 路由匹配发生在浏览器

全栈框架：   浏览器 ──请求──► 请求处理器（服务端）
                              服务端匹配路由 → 执行 loader → SSR 渲染
                              ← 路由匹配发生在服务器
```

```typescript
// SPA：数据获取是渲染之后的事（客户端组件内）
function Blog({ params }) {
  const [post, setPost] = useState(null);
  useEffect(() => {
    fetch(`/api/posts/${params.slug}`)   // 浏览器发起，晚了整个首屏
      .then(r => r.json())
      .then(setPost);
  }, [params.slug]);
}

// 全栈框架：loader 在渲染之前、服务端执行
export async function loader({ params }) {
  return { post: await db.getPost(params.slug) };
}
```

### 7.3 构建期角色：路由库是"隐形人"

| | 路由库（SPA 模式） | 全栈框架的路由 |
| ------ | ------ | ------ |
| 存在形式 | 普通 npm 依赖，运行时组件 | Vite 插件 + 构建期虚拟模块 |
| 参与 Vite 构建 | 否——只是被打进 bundle 的代码 | 是——扫描路由、生成虚拟模块、指挥双构建 |
| 控制 HTTP 请求 | 否 | 是（dev 中间件 / 生产处理器） |
| 需要 server 构建 | 否（仅一次 client 构建） | 是（双构建） |
| 路由类型生成 | 无（或需手工） | 自动（如 RR v7 的 `.react-router/types`） |

### 7.4 逐维度对比

| 维度 | Vite + 路由库（SPA） | Vite 全栈框架 |
| ------ | ------ | ------ |
| 首屏 HTML | 空壳 `index.html` + JS 渲染 | 服务端渲染的完整 HTML |
| SEO | 弱（依赖 JS 执行） | 强 |
| 数据获取 | 组件内 fetch / react-query | loader（渲染前、服务端执行） |
| 服务端能力 | 无（API 需另建后端） | 有（loader/action，可安全用密钥、直连 DB） |
| 构建产物 | 单份 client bundle | client + server 双产物 |
| 部署 | 静态托管即可 | 适配器桥接到平台运行时 |
| SSG | 不内置，需额外引 vike / prerender 方案 | 内置（模拟请求 → 快照） |
| 服务器对路由的感知 | 无——所有路径都回同一个 `index.html` | 有——每个路径对应真实渲染结果 |

```typescript
// SPA 模式下服务器/托管的全部职责（history fallback）
app.use((req, res) => res.sendFile('index.html')); // 不管什么路径，都回壳
```

> 注意：SPA 的 history fallback（`/blog/123` 不 404 而回 index.html）
> 常被误认为"服务端路由"，其实服务器根本没有区分路径的能力。

### 7.5 演进路径与选择信号

```
Vite + 路由库 ──(需要 SEO/首屏)──► vite-plugin-ssr / vike ──► 全栈框架
                                     (RR v7 / SvelteKit / Nuxt)
```

留在 SPA 模式的合理信号：后台管理系统、登录后工具类应用、
SEO 无关、纯客户端状态密集型。

迁移到全栈框架的信号：公开内容站、需要首屏性能、
数据/密钥只能放服务端、需要按路由做 SSG。

> 一句话总结：**路由库是"应用内导航"，全栈框架是"请求级路由"**。
> 前者接管的是浏览器地址栏，后者接管的是 HTTP 请求本身——
> 这决定了后续有无 SSR、loader、双构建与适配器的一切差异。

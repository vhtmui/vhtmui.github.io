# Vite 全栈框架实现原理深度笔记（整理版）

> **阅读主线**：React Router v7、Remix、SvelteKit、TanStack Start 这些基于 Vite 的全栈框架，都是按照「**定义代码约定 → 开发 → 构建 → 运行 → 预渲染 → 部署**」的顺序提供能力的。
> 本文沿这条主线层层递进，每一步都回答同一个问题：**这一步 Vite 负责什么？框架自己实现什么？**

---

## 🗺️ 〇、全景图：先建立整体认知

### 0.1 三层架构

```
┌─────────────────────────────────────┐
│         你的业务代码                  │
│   (路由文件、页面组件、loader/action) │
├─────────────────────────────────────┤
│       全栈框架层 (React Router 等)    │
│   - 文件路由与匹配                   │
│   - 数据层 (loader/action)           │
│   - SSR/SSG 渲染引擎                 │
│   - 适配器系统                        │
├─────────────────────────────────────┤
│        Vite 基础设施层                │
│   - 环境 API (client/ssr)            │
│   - 构建引擎 (Rollup)                │
│   - 开发服务器 (HMR)                 │
└─────────────────────────────────────┘
```

### 0.2 核心分工

| 能力环节 | Vite 提供 | 框架实现 |
| -------- | --------- | -------- |
| 路由约定与匹配 | — | 文件路由、路由匹配 |
| 数据获取约定 | — | loader / action 机制 |
| 开发服务器 | dev server、HMR、按需编译 | 以中间件方式挂载 SSR 逻辑 |
| 构建 | 双环境构建、Tree Shaking、代码分割 | 双构建编排、loader 剥离等专用插件 |
| SSR 渲染 | 环境 API、模块加载 | 组件 → HTML 流的渲染引擎 |
| SSG 预渲染 | 构建基础设施 | prerender 编排与文件输出 |
| 部署 | — | 适配器生态 |

### 0.3 关键洞察：框架不手写 Web 服务器

- 框架的最终产物是一个**请求处理器 (Request Handler)**，而不是服务器本身
- 开发者选择 Express/Fastify 等现成服务器，通过**适配器**挂载框架处理器
- 这使同一份应用可以部署到任何支持 JS 的环境（Node、Vercel、Cloudflare Workers）

理解了这一点，后面每一章都是在回答：**这个处理器是怎么被开发出来（第二章）、构建出来（第三章）、跑起来的（第四章）的。**

---

## 🧭 一、开发入口：框架先定义"代码约定"

框架给开发者的第一个能力不是构建，而是一套**项目约定**。后续所有的构建、渲染、数据机制，都建立在这些约定之上。

### 1.1 文件即路由

```text
app/
├── routes/
│   ├── home.tsx          → URL: /
│   ├── about.tsx         → URL: /about
│   └── blog.$slug.tsx    → URL: /blog/:slug（动态参数）
```

框架插件读取路由文件，生成路由表。这解决了 SPA 最原始的问题：**URL 和组件的映射不再手写**。

### 1.2 loader / action：数据层的统一抽象

```typescript
// app/routes/blog.$slug.tsx
export async function loader({ params }: Route.LoaderArgs) {
  // ✅ 运行在服务端（SSR 时在 Node.js，SSG 时在构建时）
  // ✅ 客户端导航时不在浏览器执行，而是通过 .data 请求触发服务端执行
  const fs = await import('node:fs');
  const content = fs.readFileSync(`./posts/${params.slug}.md`, 'utf-8');
  return { content };
}

export async function action({ request }: Route.ActionArgs) {
  // 处理表单提交等"写"操作，同样只在服务端运行
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  return <article>{loaderData.content}</article>;
}
```

要点：

- **loader 读、action 写**，返回的数据统一通过 `loaderData` 注入组件
- loader 可以直接用 `node:fs` 这类服务端模块——它能安全使用服务端能力，是因为构建系统保证了这些代码**永远不进入浏览器包**（见第三章 3.4）
- 客户端导航时不重新加载整页，而是只请求数据（见第四章 4.4）

### 1.3 双入口文件：entry.client 与 entry.server

| 入口文件 | 职责 | 关键 API |
| -------- | ---- | -------- |
| `entry.client.tsx` | 决定浏览器端如何"接活"：对已有 HTML 进行水合 | `hydrateRoot()` |
| `entry.server.tsx` | 决定服务端如何"产出"：把组件渲染成 HTML 流 | `renderToPipeableStream`（Node）/ `renderToReadableStream`（Web Streams） |

> 💡 这两个文件通常用框架默认实现即可，但它们是理解"SSR 渲染到底发生什么"的源码入口。

---

## 💻 二、开发阶段：Vite 开发服务器 + 中间件模式

### 2.1 Vite dev server 自带的能力

- **按需编译**：浏览器请求哪个模块，Vite 才即时转换哪个模块（原生 ESM，开发时不打包）
- **HMR**：模块图 + WebSocket，改动秒级热替换
- **插件管线**：React/TSX 转换、CSS 处理都在这一层完成

全栈框架要做的，是让这个面向 SPA 的服务器**也能处理 SSR 请求**。

### 2.2 middlewareMode：框架如何接管页面渲染

框架（如 `react-router dev` 命令）在内部创建 Vite 开发服务器，并启用**中间件模式**——让 Vite 不自己监听端口、不自己响应请求，而是作为一块可复用的中间件：

```javascript
// 框架 dev 命令的简化逻辑
const vite = await createViteServer({
  server: { middlewareMode: true }, // 关键：中间件模式
  appType: 'custom'                 // 关键：禁用 Vite 默认的 SPA/HTML 回退
});

// 框架把自己的 SSR 处理逻辑注册进 Vite 的中间件链
app.use(async (req, res, next) => {
  // ...框架的 SSR 处理（见 2.3）
});
```

也就是说：**开发模式下，Vite 是"宿主"，框架的 SSR 逻辑是挂在它上面的一个中间件**。

### 2.3 开发时一次页面请求发生了什么

```text
浏览器请求 /blog/hello
   ↓
Vite dev server 收到请求 → 框架 SSR 中间件处理
   ↓
① 调用 vite.ssrLoadModule()/ModuleRunner 实时加载服务端模块
   （不经过打包，直接转换 + 执行，与生产构建产物无关）
   ↓
② 匹配路由 → 执行 loader → 渲染组件为 HTML 流
   ↓
③ 在 HTML 中注入 <script type="module" src="/entry.client.tsx">
   ↓
浏览器拿到 HTML 后，再向 Vite 逐个请求 entry.client、页面组件等模块
（Vite 按需即时编译返回，HMR 通道同时建立）
```

### 2.4 dev 与 prod 的服务器对比

| 模式 | 服务器来源 | 代码来源 | 特点 |
| ------ | ----------- | --------- | ---- |
| 开发模式 (`react-router dev`) | Vite dev server（框架以中间件挂载） | **实时按需编译**，不走构建 | HMR、启动快 |
| 生产模式 (`react-router-serve` 或自选服务器) | 用户选择的 Express 等 | 构建产物 | 性能最优 |

> 💡 **常见误区**：开发模式下的 SSR 不依赖任何构建产物，`ssrLoadModule` 是现场转换、现场执行。构建只发生在你运行 `build` 时。

---

## 📦 三、构建阶段：双构建（client + server）

### 3.1 为什么必须构建两次

同一份源码要跑在**两个完全不同的运行环境**里：

| | 客户端构建 | 服务端构建 |
| -- | ---------- | ---------- |
| 运行环境 | 浏览器 | Node.js / Edge |
| 入口 | `entry.client.tsx` | 服务端入口（routes + entry.server） |
| 输出目录 | `dist/client` | `dist/server` |
| 模块处理 | 打包 + 压缩 + hash 文件名 + 代码分割 | 通常保留 ESM，依赖外部化（不打包 node_modules） |
| 触发方式 | 默认构建 | `--ssr` 标志 / 环境 API 指定 |

```javascript
// vite.config.ts（框架插件自动编排两次构建）
export default defineConfig({
  plugins: [react(), reactRouter()]
});
```

### 3.2 客户端构建的产物

- 浏览器可执行的 JS/CSS（hash 文件名、按路由代码分割）
- **manifest.json**：模块 → 产物文件的映射表。SSR 渲染时，框架靠它知道"这个页面要用哪些产物文件"，从而在 HTML 里注入 `<link rel="modulepreload">` 等预加载标签

### 3.3 服务端构建的产物：是模块，不是服务器

```javascript
// build/server/index.js —— 一个可被 import 的模块
// 它导出路由表、entry.server 渲染函数等，
// 适配器拿到它后才能创建请求处理器（见第四章）
export { routes, entry, assets };
```

> 💡 **常见误区**：服务端构建产物**不是**一个带 `listen()` 的服务器，也不是直接导出 `createRequestHandler` 的成品。它是"半成品"——由适配器在运行时消费（`createRequestHandler({ build })`），这样同一个产物才能适配 Node、Serverless、Edge 等不同运行时。

### 3.4 SSR 与 SSG 代码如何区分（三层机制）

**第一层：`import.meta.env.SSR` 静态替换 + 死代码消除**

```javascript
// 源码
if (import.meta.env.SSR) {
  const fs = await import('node:fs'); // 服务端专属
}

// 客户端构建时，Vite 静态替换为：
if (false) {
  const fs = await import('node:fs');
}
// → Rollup 识别为死代码，整段剔除，node:fs 根本不会出现在浏览器包里
```

**第二层：框架剥离 loader / action**

客户端导航并不需要 loader 的**代码**，只需要它的**执行结果**（通过 `.data` 请求获取）。因此框架插件在客户端构建时，会直接把所有路由模块中的 `loader`/`action` 导出替换为空实现——**loader 代码整体不进入浏览器包**。

**第三层：Tree Shaking 兜底**

客户端未引用的导出由 Rollup 自动移除，作为最后一道保障。

### 3.5 补充：Vite 6 的环境 API

早期 Vite 只有写死的 `client` 和 `ssr` 两个环境。Vite 6 的 **Environment API** 把它们升级为一等公民：

- 每个**环境**可独立配置插件钩子、模块转换行为
- `builder` API 允许一次配置编排多个环境的构建（框架的"双构建"编排更自然）
- 开发时服务端模块加载演进为 `ModuleRunner`（`ssrLoadModule` 的后继者）

框架正是这套环境 API 的第一批重度用户：**"client/ssr 双环境"从框架的私有 hack 变成了 Vite 的标准抽象**。

---

## 🚀 四、运行阶段：请求处理器与适配器

### 4.1 一切基于 Web 标准：Request → Response

框架的核心处理器**完全基于 Fetch API 标准编写**：

```text
Request（标准对象） → [路由匹配 → loader → 渲染] → Response（标准对象）
```

这正是 0.3 节"不手写服务器"能成立的技术前提：**Node 18+、Bun、Deno、Cloudflare Workers 都原生支持这套标准**，处理器无需为任何具体平台改写。

### 4.2 一次 SSR 请求的完整生命周期

```text
① 适配器把平台请求转换为标准 Request，交给请求处理器
② 框架匹配路由（文件路由生成的路由表）
③ 并行执行匹配到的所有 loader（+ action）
④ entry.server 调用 renderToPipeableStream / renderToReadableStream
   把组件树渲染为 HTML 流（支持 Suspense 流式发送，先到先发）
⑤ 从 manifest 中找出该页面所需的 JS/CSS，注入预加载标签，
   并把 loader 数据序列化进 HTML（供 hydration 使用）
⑥ 返回标准 Response → 适配器写回具体平台
⑦ 浏览器执行客户端包，hydrateRoot() 接管已有 HTML，页面可交互
```

### 4.3 适配器：连接具体服务器

```javascript
// Node + Express 适配器（@react-router/express 真实用法）
import { createRequestHandler } from '@react-router/express';
import express from 'express';

const app = express();

app.use(
  createRequestHandler({
    build: await import('./build/server/index.js') // 消费服务端构建产物
  })
);

app.listen(3000);
```

适配器内部做两件事：

1. **入方向**：把 Express 的 `req/res` 转换为标准 `Request`（URL、method、headers、body）
2. **出方向**：把处理器返回的标准 `Response` 写回 `res`（status、headers、流式 body）

生产部署时也可以不做任何适配——直接用框架自带的 `react-router-serve`（内部就是一个 Node HTTP 服务器 + 官方适配器）。

### 4.4 客户端导航：`.data` 单请求

首屏由 SSR 返回完整 HTML；之后的客户端导航不再请求 HTML：

```text
点击 <Link to="/blog/hello">
   ↓
路由器拦截导航，向服务端请求：GET /blog/hello.data
   ↓
服务端执行该路由的 loader → 序列化数据返回（单请求，无 HTML）
   ↓
路由器更新 UI，无需整页刷新、无需重新执行 JS 入口
```

这就是 1.2 节"loader 代码不进浏览器包、结果通过 `.data` 获取"的运行时落地。

### 4.5 适配器生态与部署目标

| 部署目标 | 适配方式 |
| -------- | -------- |
| Node 服务器 | `@react-router/express` / `react-router-serve` |
| Vercel / Netlify | 平台官方适配器，输出 Serverless 函数 |
| Cloudflare Workers | Workers 原生即 Request/Response 标准，**几乎零适配成本**——最能体现 Web 标准的价值 |

---

## 📄 五、SSG 预渲染：把运行时搬到构建时

### 5.1 明确分工

| 角色 | 职责 |
|------|------|
| **Vite** | 执行双构建、提供打包能力与环境 API |
| **框架** | 触发预渲染、收集路由、执行 loader、渲染 HTML、输出文件 |

Vite 只提供基础设施；**"在构建时模拟一次 SSR 请求"这件事由框架编排**。

### 5.2 prerender 配置与执行流程

```typescript
// react-router.config.ts
export default {
  ssr: true,
  prerender: ['/', '/about']
  // 或动态收集：async ({ getStaticPaths }) => {
  //   const posts = await getPosts();
  //   return ['/', ...posts.map(p => `/blog/${p.slug}`)];
  // }
};
```

执行流程（`pnpm build` 之后）：

```text
① Vite 完成双构建（client + server）
② 框架插件接管：调用 prerender() 获取路径列表
③ 对每个路径，在 Node.js 中"模拟访问"：
   匹配路由 → 执行 loader → 渲染组件为 HTML 字符串/流
④ 写入产物：
   dist/client/index.html        ← 预渲染好的完整 HTML
   dist/client/blog/hello.data   ← 序列化的 loader 数据
```

### 5.3 SSR vs SSG 产物与行为对比

| 对比项 | SSR | SSG |
| -------- | ----- | ----- |
| 核心 JS 包 | 相同 | 相同 |
| HTML 生成 | 请求时动态渲染 | 构建时预生成，静态托管直接返回 |
| loader 执行时机 | 运行时（Node.js） | 构建时（同样是 Node.js） |
| 客户端导航取数 | fetch `/blog/hello.data` → 服务端实时执行 loader | fetch `/blog/hello.data` → **直接命中构建时生成的静态文件** |

注意一个精妙之处：**SSR 和 SSG 的 `.data` 请求 URL 完全一致**。区别只是背后由"服务端实时执行 loader"变成了"静态文件服务器直接返回快照"——对客户端代码完全透明。

**关键结论**：SSG 的本质是**把运行时动态执行 loader 的行为，提前到构建时执行一次，并把结果固化为静态 HTML + `.data` 数据快照**。

### 5.4 混合渲染

`prerender` 与 `ssr` 配置可以组合：

- `ssr: true` + 部分 `prerender` 路径 → 热门页面静态化，其余走 SSR
- `ssr: false` + `prerender` → 纯 SSG 模式（静态站点）

---

## 🎯 六、总结

### 6.1 Vite 在全栈框架中的三个角色

| 角色 | 具体内容 |
| ---- | -------- |
| **环境定义者** | 环境 API 把 client/ssr 划分为两个可独立配置的环境；提供 `import.meta.env.SSR` 等编译期标识 |
| **构建执行者** | 编排双构建；Rollup 完成 Tree Shaking、代码分割；manifest 支撑资源预加载 |
| **开发服务器** | 按需编译 + HMR；框架 SSR 逻辑以**中间件模式**挂载其中 |

### 6.2 按开发流程回看全链路

```text
开发约定（路由/loader/双入口）
   ↓
dev：Vite 中间件模式 + ssrLoadModule 实时 SSR + HMR
   ↓
build：双构建（client 产物 + manifest / server 产物模块）
      代码区分三件套：env.SSR 静态替换、loader 剥离、Tree Shaking
   ↓
run：适配器 + 请求处理器（Request → loader → 流式渲染 → hydration）
     客户端导航走 .data 单请求
   ↓
prerender（可选）：构建时模拟 SSR 请求，固化 HTML + .data 快照
   ↓
deploy：Node / Serverless / Edge，同一份产物，适配器换即可
```

### 6.3 一表总览

| 问题 | 答案 |
| ------ | ------ |
| 框架要手写 Web 服务器吗？ | **不需要**。框架产出请求处理器，服务器由适配器接入 |
| Vite 如何打包服务端代码？ | `--ssr` / 环境 API 触发独立的**服务端构建**，产物是可被适配器消费的**模块** |
| 如何区分 SSR 与 SSG 代码？ | `import.meta.env.SSR` 静态替换 + 框架剥离 loader + Tree Shaking |
| 开发模式有构建吗？ | **没有**。dev 时通过 `ssrLoadModule`/ModuleRunner 实时转换执行 |
| SSG 预渲染谁完成？ | **框架**。Vite 只提供构建基础设施 |
| SSR 和 SSG 客户端产物一样吗？ | **核心 JS 包一样**。SSG 额外生成静态 HTML 与 `.data` 数据快照 |
| Vite 的核心作用？ | 环境抽象、构建能力、开发服务器 |

---

## 📖 延伸阅读

- [Vite SSR 官方指南](https://vitejs.dev/guide/ssr)
- [Vite 环境 API](https://vitejs.dev/guide/api-environment)
- [React Router v7 框架模式](https://reactrouter.com/start/framework/installation)
- [React Router v7 部署文档](https://reactrouter.com/start/deploying)

---

*本文基于对 Vite 全栈框架实现原理的深度探讨整理而成，核心观点源于实际源码分析和社区最佳实践。*

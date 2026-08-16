// 文档索引入口：由 scripts/gen-docs.js 在构建/开发启动时生成，
// 只包含当前 DEPLOY_TARGET 允许访问的文档（与原项目 walkDir + shouldAccessedDoc 行为一致）。
export { docItems, getDocContent } from '../generated/docs-index.js';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { runGenDocs } from './scripts/gen-docs.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

// 与 SvelteKit 版本保持一致：dev 模式 base 为空，构建时使用 BASE_PATH（GitHub Pages 场景）
const base = process.env.BASE_PATH ?? '';

export default defineConfig({
	base: base || '/',
	plugins: [
		// 每次启动（dev / build / preview）时按 DEPLOY_TARGET 重新生成文档索引
		{
			name: 'generate-docs-index',
			configResolved() {
				runGenDocs();
			}
		},
		react(),
		tailwindcss(),
		// SPA fallback：把 index.html 复制为 404.html，保证 GitHub Pages / 静态服务器上的深链接可用
		{
			name: 'emit-404-html',
			apply: 'build',
			closeBundle() {
				const outDir = resolve(__dirname, 'build');
				const html = readFileSync(resolve(outDir, 'index.html'), 'utf-8');
				writeFileSync(resolve(outDir, '404.html'), html);
			}
		}
	],
	resolve: {
		alias: {
			'@lib': resolve(__dirname, 'src/lib'),
			'@ui': resolve(__dirname, 'src/lib/components/ui'),
			'@my': resolve(__dirname, 'src/lib/components/my')
		}
	},
	define: {
		__BASE_PATH__: JSON.stringify(base),
		__DEPLOY_TARGET__: JSON.stringify(process.env.DEPLOY_TARGET ?? '')
	},
	build: {
		outDir: 'build',
		emptyOutDir: true
	}
});

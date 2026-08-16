// 生成 src/generated/docs-index.js：
// 构建/开发启动时遍历 docs 目录，按 DEPLOY_TARGET 过滤（与原项目 walkDir + shouldAccessedDoc 一致），
// 只把允许访问的文档以 ?raw 形式打包，排除的文档内容不会进入产物。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __filename = fileURLToPath(import.meta.url);
const root = path.resolve(__dirname, '..');
const docsDir = path.join(root, 'docs');
const outDir = path.join(root, 'src', 'generated');
const outFile = path.join(outDir, 'docs-index.js');

const deployTarget = process.env.DEPLOY_TARGET ?? '';

/** 与原项目 src/lib/my-utils/index.js 的 shouldAccessedDoc 一致 */
function shouldAccessedDoc(relativePath) {
	const normalizedPath = String(relativePath || '')
		.replace(/\\/g, '/')
		.replace(/^\.?\//, '');
	const subPath = normalizedPath.slice(5);

	if (deployTarget === 'github') {
		return !subPath.startsWith('未整理的部分');
	}

	if (deployTarget === 'internal') {
		return !subPath.startsWith('未整理的部分') && !subPath.startsWith('blogs');
	}

	return true;
}

/** 与原项目 walkDir(dirPath, filterFn, { includeRoot: true }) 相同的深度优先遍历顺序 */
function walkDir() {
	const results = [];

	const rootStat = fs.statSync(docsDir);
	const rootEntry = {
		name: path.basename(docsDir),
		path: docsDir,
		relativePath: path.relative(root, docsDir).replace(/\\/g, '/'),
		isDirectory: true,
		isFile: false,
		isSymbolicLink: false,
		size: rootStat.size,
		birthtime: null,
		mtime: null,
		ext: null,
		parent: path.relative(root, path.dirname(docsDir)).replace(/\\/g, '/')
	};
	if (shouldAccessedDoc(rootEntry.relativePath)) {
		results.push(rootEntry);
	}

	(function _walk(currentPath) {
		// 使用原生 readdirSync 顺序（与原项目 walkDir 一致，不做额外排序）
		const items = fs.readdirSync(currentPath, { withFileTypes: true });

		for (const item of items) {
			const fullPath = path.join(currentPath, item.name);
			const stat = fs.statSync(fullPath);

			const entry = {
				name: item.name,
				path: fullPath,
				relativePath: path.relative(root, fullPath).replace(/\\/g, '/'),
				isDirectory: item.isDirectory(),
				isFile: item.isFile(),
				isSymbolicLink: item.isSymbolicLink(),
				size: stat.size,
				birthtime: null,
				mtime: null,
				ext: item.isFile() ? path.extname(item.name) : null,
				parent: path.relative(root, currentPath).replace(/\\/g, '/')
			};

			if (shouldAccessedDoc(entry.relativePath)) {
				results.push(entry);
			}

			if (item.isDirectory()) {
				_walk(fullPath);
			}
		}
	})(docsDir);

	return results;
}

export function runGenDocs() {
	const items = walkDir();

	const fileEntries = items.filter((d) => d.isFile);

	const imports = fileEntries
		.map((d, i) => {
			const rel = path.relative(outDir, d.path).replace(/\\/g, '/');
			return `import content${i} from '${rel}?raw';`;
		})
		.join('\n');

	const itemLines = items.map((d, i) => {
		const contentExpr = d.isFile ? `content${fileEntries.indexOf(d)}` : 'undefined';
		return `	{
		name: ${JSON.stringify(d.name)},
		path: ${JSON.stringify(d.relativePath)},
		relativePath: ${JSON.stringify(d.relativePath)},
		isDirectory: ${d.isDirectory},
		isFile: ${d.isFile},
		isSymbolicLink: ${d.isSymbolicLink},
		size: ${d.size},
		birthtime: null,
		mtime: null,
		ext: ${JSON.stringify(d.ext)},
		parent: ${JSON.stringify(d.parent)},
		content: ${contentExpr}
	}`;
	});

	const content = `// 由 scripts/gen-docs.js 自动生成，请勿手动修改（DEPLOY_TARGET: ${deployTarget || '(default)'}）
${imports}

export const docItems = [
${itemLines.join(',\n')}
];

const contentByPath = new Map();
for (const d of docItems) {
	if (d.isFile && typeof d.content === 'string') {
		contentByPath.set(d.relativePath, d.content);
	}
}

export function getDocContent(docPath) {
	const p = docPath.endsWith('.md') ? docPath : docPath + '.md';
	return contentByPath.get(p);
}
`;

	fs.mkdirSync(outDir, { recursive: true });
	fs.writeFileSync(outFile, content, 'utf-8');
	return outFile;
}

// 直接以脚本方式运行时执行
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
	const f = runGenDocs();
	console.log('generated:', f);
}

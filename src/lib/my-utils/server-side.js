import fs from 'fs';
import path from 'path';

/**
 * 递归遍历文件夹，返回所有子项（文件和文件夹）
 * @param {string} dirPath - 文件夹路径（绝对或相对）
 * @param {Function} filterFn - 过滤函数，接收文件/文件夹对象，返回 boolean
 * @returns {Array<{
 *   name: string,
 *   path: string,
 *   relativePath: string,
 *   isDirectory: boolean,
 *   isFile: boolean,
 *   isSymbolicLink: boolean,
 *   size: number,
 *   birthtime: Date,
 *   mtime: Date,
 *   ext: string | null,
 *   parent: string
 * }>} 符合条件的对象数组
 */
export function walkDir(dirPath, filterFn = () => true) {
	const results = [];
	const absolutePath = path.resolve(dirPath);

	const items = fs.readdirSync(absolutePath, { withFileTypes: true });

	for (const item of items) {
		const fullPath = path.join(absolutePath, item.name);
		const stat = fs.statSync(fullPath);

		const entry = {
			name: item.name,
			path: fullPath,
			relativePath: path.relative(process.cwd(), fullPath),
			isDirectory: item.isDirectory(),
			isFile: item.isFile(),
			isSymbolicLink: item.isSymbolicLink(),
			size: stat.size,
			birthtime: stat.birthtime,
			mtime: stat.mtime,
			ext: item.isFile() ? path.extname(item.name) : null,
			parent: absolutePath
		};

		if (filterFn(entry)) {
			results.push(entry);
		}

		if (item.isDirectory()) {
			const subResults = walkDir(fullPath, filterFn);
			results.push(...subResults);
		}
	}

	return results;
}

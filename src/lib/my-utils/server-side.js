import fs from 'fs';
import path from 'path';

/**
 * 递归遍历文件夹，返回所有子项（文件和文件夹）
 * @param {string} dirPath - 文件夹路径（绝对或相对）
 * @param {Function} filterFn - 过滤函数，接收文件/文件夹对象，返回 boolean
 * @param {Object} [options] - 配置项，可选属性：
 *   - includeRoot: 是否包含根目录本身（默认为 false）
 *   - maxDepth: 最大递归深度（默认为 Infinity，0 表示仅根目录）
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
export function walkDir(dirPath, filterFn = () => true, options = {}) {
	const { includeRoot = false, maxDepth = Infinity } = options;
	const results = [];
	const absolutePath = path.resolve(dirPath);

	function _walk(currentPath, currentDepth) {
		if (currentDepth > maxDepth) {
			return;
		}

		const items = fs.readdirSync(currentPath, { withFileTypes: true });

		for (const item of items) {
			const fullPath = path.join(currentPath, item.name);
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
				parent: currentPath
			};

			if (filterFn(entry)) {
				results.push(entry);
			}

			if (item.isDirectory()) {
				_walk(fullPath, currentDepth + 1);
			}
		}
	}

	// include root if requested and within depth
	if (includeRoot && maxDepth >= 0) {
		const stat = fs.statSync(absolutePath);
		const rootEntry = {
			name: path.basename(absolutePath),
			path: absolutePath,
			relativePath: path.relative(process.cwd(), absolutePath),
			isDirectory: stat.isDirectory(),
			isFile: stat.isFile(),
			isSymbolicLink: stat.isSymbolicLink(),
			size: stat.size,
			birthtime: stat.birthtime,
			mtime: stat.mtime,
			ext: stat.isFile() ? path.extname(absolutePath) : null,
			parent: path.dirname(absolutePath)
		};
		if (filterFn(rootEntry)) {
			results.push(rootEntry);
		}
	}

	_walk(absolutePath, 1);

	return results;
}

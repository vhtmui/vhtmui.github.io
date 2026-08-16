import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router.jsx';
import { initTheme } from './lib/theme.js';
import './layout.css';

// gray-matter 依赖 Node 的 Buffer 全局对象；浏览器端提供一个最小兼容 shim。
// gray-matter 仅用 Buffer.isBuffer / Buffer.from 做字符串归一化，这里直接透传字符串即可。
if (typeof window !== 'undefined' && typeof window.Buffer === 'undefined') {
	window.Buffer = {
		isBuffer: () => false,
		from: (input) => input,
		alloc: () => undefined
	};
}

initTheme();

createRoot(document.getElementById('root')).render(<RouterProvider router={router} />);

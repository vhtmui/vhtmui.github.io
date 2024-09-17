// @ts-nocheck
export const root = {
	tools: {
		$link: 'tools',
		$title: 'Tools',
		operations: {
			$link: 'operations',
			$title: 'OPS',
			dis_arp: {
				$link: 'dis-arp',
				$title: 'Dis-Arp'
			}
		}
	},
	docs: {
		$link: 'docs',
		$title: 'Docs',
	},
	posts: {
		$link: 'posts',
		$title: 'Posts',
	},
}

/**
 * return child objects from a parent object.
 * @param {root} obj
 */
export function get_child_array(obj) {
	let keys = Object.keys(obj).filter((t) => t && !t.startsWith('$'));
	return keys.map(key => obj[key]);
}
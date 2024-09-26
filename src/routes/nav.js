// @ts-nocheck
/**
 * @typedef {Object} Tree
 * @property {string} _link - The link for the tree.
 * @property {string} _title - The title for the tree.
 * @property {Object<Tree>} [children] - Optional children nodes. Each child must also be a Tree.
 */

/**
 * The root object representing a directory tree where each tree has a _link and _title,
 * and can optionally have children nodes that follow the same structure.
 * @type {Tree}
 */
export const root = {
	_link: '/',
	_title: 'root',
	tools: {
		_link: 'tools',
		_title: 'Tools',
		operations: {
			_link: 'operations',
			_title: 'OPS',
			dis_arp: {
				_link: 'dis-arp',
				_title: 'Dis-Arp'
			},
			showMaterials: {
				_link: 'showMaterials',
				_title: 'ShowMaterials',
				processNeed: {
					_link: 'processNeed',
					_title: 'ProcessNeed'
				}
			}
		},
		office: {
			_link: 'office',
			_title: 'Office',
			processNeed: {
				_link: 'processNeed',
				_title: 'ProcessNeed'
			}
		}
	},
	docs: {
		_link: 'docs',
		_title: 'Docs'
	},
	posts: {
		_link: 'posts',
		_title: 'Posts'
	}
};

/**
 * return child objects from a parent object.
 * @param {Tree} obj
 */
export function get_childArray(obj) {
	let keys = Object.keys(obj).filter((t) => t && !t.startsWith('_'));
	if (keys.length === 0) {
		return null;
	} else {
		return keys.map((key) => obj[key]);
	}
}

/**
 * return child objects from a parent object.
 * @param {Tree} obj
 */
export function getAll_propertyNames(obj) {
	let alltitles = '';
	Object.keys(obj).forEach((p) => {
		if (typeof obj[p] === 'object' && obj[p] !== null && !p.startsWith('_')) {
			let titles = getAll_propertyNames(obj[p]);

			alltitles = [alltitles, obj[p]._title, titles].filter((f) => f).join('`');
		}
	});
	return alltitles;
}

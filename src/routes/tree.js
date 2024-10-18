// @ts-nocheck
/**
 * @typedef {Object} Tree
 * @property {string} _link - The link for the tree.
 * @property {string} _title - The title for the tree.
 * @property {Tree} [any] - Optional children nodes. Each child must also be a Tree.
 */

/**
 * The root object representing a directory tree where each tree has a _link and _title,
 * and can optionally have children nodes that follow the same structure.
 * @type {Tree}
 */
export const root = {
	_link: '/',
	_title: 'Home',
	tools: {
		_link: 'tools',
		_title: 'Tools',
		operations: {
			_link: 'operations',
			_title: 'OPS',
			dis_arp: {
				_link: 'dis-arp',
				_title: 'Dis-Arp',
			},
			showMaterials: {
				_link: 'showMaterials',
				_title: 'ShowMaterials',
				processNeed: {
					_link: 'processNeed',
					_title: 'ProcessNeed',
				}
			}
		},
		office: {
			_link: 'office',
			_title: 'Office',
			processNeed: {
				_link: 'processNeed',
				_title: 'ProcessNeed',
			}
		}
	},
	docs: {
		_link: 'docs',
		_title: 'Docs',
	},
	posts: {
		_link: 'posts',
		_title: 'Posts',
	}
};

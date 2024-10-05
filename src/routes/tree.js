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
	_title: 'Home',
	_id: 1,
	tools: {
		_link: 'tools',
		_title: 'Tools',
		_id: 2,
		operations: {
			_link: 'operations',
			_title: 'OPS',
			_id: 3,
			dis_arp: {
				_link: 'dis-arp',
				_title: 'Dis-Arp',
				_id: 4,
			},
			showMaterials: {
				_link: 'showMaterials',
				_title: 'ShowMaterials',
				_id: 5,
				processNeed: {
					_link: 'processNeed',
					_title: 'ProcessNeed',
					_id: 6,
				}
			}
		},
		office: {
			_link: 'office',
			_title: 'Office',
			_id: 7,
			processNeed: {
				_link: 'processNeed',
				_title: 'ProcessNeed',
				_id: 8,
			}
		}
	},
	docs: {
		_link: 'docs',
		_title: 'Docs',
		_id: 9,
	},
	posts: {
		_link: 'posts',
		_title: 'Posts',
		_id: 10,
	}
};

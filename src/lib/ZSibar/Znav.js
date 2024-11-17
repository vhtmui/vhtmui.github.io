/**
 * @typedef {Object} Tree
 * @property {string} _link - The link for the tree.
 * @property {string} _title - The title for the tree.
 * @property {Tree} [*] - Optional children nodes. Each child must also be a Tree.
 */

/**
 * Return child objects from a parent object, excluding objects whose names start with string '_'
 * @param {Tree} obj
 * @returns {Tree}
 */
export function get_childArray(obj) {
	let keys;
	if (obj) {
		keys = Object.keys(obj).filter((t) => t && !t.startsWith('_'));
	} else {
		return null;
	}
	if (keys.length === 0) {
		return null;
	} else {
		return keys.map((key) => obj[key]);
	}
}

/**
 * return a string consisting of all the child objects of the parent object.
 * @param {Tree} obj
 * @returns {string}
 */
export function getAll_propertyNames(obj) {
	let alltitles = '';
	if (obj) {
		Object.keys(obj).forEach((p) => {
			if (typeof obj[p] === 'object' && obj[p] !== null && !p.startsWith('_')) {
				let titles = getAll_propertyNames(obj[p]);

				alltitles = [alltitles, obj[p]._title, titles].filter((f) => f).join('`');
			}
		});
		return alltitles;
	} else {
		return null;
	}
}

/**
 * Builds the tree from an array of links.
 * @param {string[]} links - The array of links to build the tree from.
 * @returns {Tree} - The root of the tree.
 */
export function buildTree(r, links) {
	const root = r;
	if (links) {
		links.forEach((link) => {
			if (link === '') return;

			const parts = link.split('/').filter(Boolean);
			let currentNode = root;

			parts.forEach((part) => {
				if (!currentNode[part]) {
					currentNode[part] = {
						_link: `${part}`,
						_title: part
					};
				}
				currentNode = currentNode[part];
			});
		});
	}

	return root;
}

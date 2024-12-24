/**
 * @typedef {Object} Tree
 * @property {string} _link - The link for the tree.
 * @property {string} _title - The title for the tree.
 * @property {Tree} [*] - Optional children nodes. Each child must also be a Tree.
 */
class Tree {
    #title = '/';
    #link = '/';
    #children = [];
    constructor(dirArray) {
        if (dirArray) {
            dirArray.forEach((dir) => {
                let currentNode = this;
                let parts = dir.split('/').filter(Boolean);
                parts.forEach((part, i) => {
                    let index = currentNode.#children.findIndex((v) => v.#title === part);
                    if (index === -1) {
                        const newTree = new Tree();
                        newTree.#title = part;
                        newTree.#link = '/' + parts.slice(0, i + 1).join('/');
                        currentNode.#children.push(newTree);
                        currentNode = newTree;
                    } else {
                        currentNode = currentNode.#children[index];
                    }
                });
            });
        }
    }
    get title() {
        return this.#title;
    }
    set title(title) {
        this.#title = title;
    }
    get link() {
        return this.#link;
    }
    set link(link) {
        this.#link = link;
    }
    get children() {
        // 返回新的数组，禁止直接修改children
        return [...this.#children];
    }
    /**
     * Returns a set of all the titles in the tree, including the current node's title.
     * @returns {Set<string>} A set of all the titles in the tree.
     */
    getAllChildTitle() {
        let result = [];
        if (this.#children.length > 0) {
            this.#children.forEach((child) => result.push(...child.getAllChildTitle(), this.#title));
        } else {
            result.push(this.#title);
        }
        return new Set(result);
    }
    #getPubObject() {
        let pubObj = { link: this.#link, title: this.#title, children: [] };
        if (this.#children.length > 0) {
            pubObj.children = this.#children.map((tree) => tree.#getPubObject());
        }
        return pubObj;
    }
    /**
     * Returns the JSON string representation of the tree.
     * @param {Function|null} replacer — A function that transforms the results.
     * @param {number} space — Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
     * @returns {string}
     */
    toString(replacer = null, space = 4) {
        if (arguments.length === 1)
            return JSON.stringify(this.#getPubObject(), null, arguments[0])
        return JSON.stringify(this.#getPubObject(), replacer, space);
    }
}
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



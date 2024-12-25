/**
 * Represents a tree structure with nodes containing titles, links, and children.
 * Each node can have multiple children, forming a hierarchical structure.
 */
export class Tree {
	#title = '/';
	#link = '/';
	#children = [];
	/**
	 * Creates a new Tree instance.
	 * @param {string[]} dirArray - An array of directory paths.
 	 * @example
 	 * const tree = new Tree(['a/b', 'a/c/d']);
 	 * console.log(tree.toString());
	 */
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
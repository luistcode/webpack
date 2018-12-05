/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const NO_MARKER = 0;
const IN_PROGRESS_MARKER = 1;
const DONE_MARKER = 2;
const ROOT_MARKER = 3;

class Node {
	constructor(item) {
		this.item = item;
		this.dependencies = new Set();
		this.marker = NO_MARKER;
		this.cycleCounter = 0;
	}
}

/**
 * @typedef {Object} StackEntry
 * @property {Node} node
 * @property {Node[]} openEdges
 */

module.exports = ({ items, getDependencies }) => {
	const itemToNode = new Map();
	for (const item of items) {
		const node = new Node(item);
		itemToNode.set(item, node);
	}

	if(itemToNode.size <= 1) return items;

	for (const node of itemToNode.values()) {
		for (const dep of getDependencies(node.item)) {
			const depNode = itemToNode.get(dep);
			node.dependencies.add(depNode);
		}
	}

	/** @type {Set<Node>} */
	const roots = new Set();
	let maxCycleCounter = 0;

	for (const selectedNode of itemToNode.values()) {
		if (selectedNode.marker === NO_MARKER) {
			selectedNode.marker = IN_PROGRESS_MARKER;
			/** @type {StackEntry[]} */
			const stack = [
				{
					node: selectedNode,
					openEdges: Array.from(selectedNode.dependencies)
				}
			];
			while (stack.length > 0) {
				const topOfStack = stack[stack.length - 1];
				if (topOfStack.openEdges.length > 0) {
					const dependency = topOfStack.openEdges.pop();
					switch (dependency.marker) {
						case NO_MARKER:
							stack.push({
								node: dependency,
								openEdges: Array.from(dependency.dependencies)
							});
							break;
						case IN_PROGRESS_MARKER:
							// mark all nodes in the cycle
							for (
								let i = stack.length - 1;
								stack[i].node !== dependency;
								i--
							) {
								stack[i].node.cycleCounter++;
							}
							dependency.cycleCounter++;
							if (dependency.cycleCounter > maxCycleCounter)
								maxCycleCounter = dependency.cycleCounter;
							break;
						case ROOT_MARKER:
							// not really a root
							dependency.marker = DONE_MARKER;
							roots.delete(dependency);
							break;
						// DONE_MARKER: nothing to do, don't walk dependencies
					}
				} else {
					stack.pop();
					const node = topOfStack.node;
					node.marker = DONE_MARKER;
				}
			}
			if (selectedNode.cycleCounter === 0) {
				selectedNode.marker = ROOT_MARKER;
				roots.add(selectedNode);
			}
		}
	}

	// When roots were found, return them
	if(roots.size > 0) {
		return Array.from(roots, r => r.item);
	}

	// When no cycles were found
	if(maxCycleCounter === 0)
};

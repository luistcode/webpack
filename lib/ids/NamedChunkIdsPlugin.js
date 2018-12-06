/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

"use strict";

const { compareChunksNatural } = require("../util/comparators");
const assignAscendingChunkIds = require("./assignAscendingChunkIds");

/** @typedef {import("../Chunk")} Chunk */
/** @typedef {import("../Compiler")} Compiler */
/** @typedef {import("../Module")} Module */

const requestToId = request => {
	return request
		.replace(/^(\.\.?\/)+/, "")
		.replace(/(^[.-]|[^a-zA-Z0-9_-])+/g, "_");
};

class NamedChunkIdsPlugin {
	constructor(options) {
		if (typeof options === "function") {
			this.getName = options;
		} else {
			this.delimiter = (options && options.delimiter) || "~";
		}
	}

	/**
	 * @param {Compiler} compiler webpack compiler
	 * @returns {void}
	 */
	apply(compiler) {
		compiler.hooks.compilation.tap("NamedChunkIdsPlugin", compilation => {
			compilation.hooks.chunkIds.tap("NamedChunkIdsPlugin", chunks => {
				const chunkGraph = compilation.chunkGraph;

				/** @type {Map<string, Chunk[]>} */
				const nameToChunksMap = new Map();
				const unnamedChunks = [];
				for (const chunk of chunks) {
					if (chunk.id === null) {
						const name = this.getName(chunk, compilation);
						if (name) {
							let array = nameToChunksMap.get(name);
							if (array === undefined) {
								array = [];
								nameToChunksMap.set(name, array);
							}
							array.push(chunk);
						} else {
							unnamedChunks.push(chunk);
						}
					}
				}

				const compareNatural = compareChunksNatural(chunkGraph);

				const usedIds = new Set();
				if (compilation.usedChunkIds) {
					for (const id of compilation.usedChunkIds) {
						usedIds.add(id);
					}
				}

				for (const chunk of chunks) {
					const chunkId = chunk.id;
					if (chunkId !== null) {
						usedIds.add(chunkId);
					}
				}

				for (const [name, chunks] of nameToChunksMap) {
					if (chunks.length > 1 || usedIds.has(name)) {
						chunks.sort(compareNatural);
						let nextIndex = 0;
						for (const chunk of chunks) {
							while (
								usedIds.has(name + nextIndex) ||
								nameToChunksMap.has(name + nextIndex)
							)
								nextIndex++;
							const id = name + nextIndex;
							chunk.id = id;
							chunk.ids = [id];
							nextIndex++;
						}
					} else {
						const chunk = chunks[0];
						chunk.id = name;
						chunk.ids = [name];
					}
				}

				unnamedChunks.sort(compareNatural);
				assignAscendingChunkIds(unnamedChunks, compilation);
			});
		});
	}

	getName(chunk, { chunkGraph }) {
		if (chunk.name) return chunk.name;
		const modules = chunkGraph.getChunkRootModules(chunk);
		if (modules.length === 0) return null;
		const ids = modules
			.map(m => requestToId(chunkGraph.getModuleId(m) + ""))
			.sort();
		return ids.join(this.delimiter);
	}
}

module.exports = NamedChunkIdsPlugin;

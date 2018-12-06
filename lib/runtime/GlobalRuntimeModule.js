/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/

"use strict";

const RuntimeGlobals = require("../RuntimeGlobals");
const RuntimeModule = require("../RuntimeModule");

class GlobalRuntimeModule extends RuntimeModule {
	constructor() {
		super("global");
	}

	/**
	 * @returns {string} runtime code
	 */
	generate() {
		return `${RuntimeGlobals.global} = {};`;
	}
}

module.exports = GlobalRuntimeModule;

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/

"use strict";

const RuntimeGlobals = require("../RuntimeGlobals");
const ConstDependency = require("./ConstDependency");

exports.createGlobalDependency = range => {
	return new ConstDependency(RuntimeGlobals.global, range, [
		RuntimeGlobals.global
	]);
};

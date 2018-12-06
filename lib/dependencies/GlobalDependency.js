const RuntimeGlobals = require("../RuntimeGlobals");
const ConstDependency = require("./ConstDependency");

class GlobalDependency extends ConstDependency {
	constructor(range) {
		super(RuntimeGlobals.global, range, [RuntimeGlobals.global]);
	}
}

module.exports = GlobalDependency;

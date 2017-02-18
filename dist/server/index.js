"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var di = require("akala-core");
var debug = require("debug");
var log = debug('domojs:assets');
di.injectWithName(['$master'], function (master) {
    master(module.filename, './master', './virtual');
})();
__export(require("./virtual"));

//# sourceMappingURL=index.js.map

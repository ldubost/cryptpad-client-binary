/*@flow*/
;(function () {
"use strict";
var create = function (resourceCount /*:number*/) {
    var queue = [];
    var check;
    var mkRa = function () {
        var outerCalled = 0;
        return function (func) {
            if (outerCalled++) { throw new Error("returnAfter() called multiple times"); }
            var called = 0;
            return function () {
                if (called++) {
                    throw new Error("returnAfter wrapped callback called multiple times");
                }
                if (func) { func.apply(null, arguments); }
                resourceCount++;
                check();
            };
        };
    };
    check = function () {
        if (resourceCount < 0) { throw new Error("(resourceCount < 0) should never happen"); }
        if (resourceCount === 0 || queue.length === 0) { return; }
        resourceCount--;
        queue.shift()(mkRa());
    };
    return {
        take: function (func /*:((...Array<any>)=>(...Array<any>)=>void)=>void*/) {
            queue.push(func);
            check();
        }
    };
};
if (typeof(window) === 'object') {
    if (window.define && window.define.amd) {
        window.define({ create: create });
    } else {
        window.Saferphore = { create: create };
    }
} else if (typeof(module) === 'object' && module.exports) {
    module.exports.create = create;
}
}());

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var last = function (arr) {
    if (arr === void 0) { arr = []; }
    return arr[arr.length - 1];
};
var next2last = function (arr) {
    if (arr === void 0) { arr = []; }
    return arr[arr.length - 2];
};
var next3last = function (arr) {
    if (arr === void 0) { arr = []; }
    return arr[arr.length - 3];
};
var noop = Function.prototype;
function copyFnProps(oldFn, newFn) {
    Object.keys(oldFn).forEach(function (key) {
        newFn[key] = oldFn[key];
    });
    return newFn;
}
function expressAsyncPatch(errorhandler) {
    var Layer = require('express/lib/router/layer');
    var Router = require('express/lib/router');
    function wrap(fn) {
        var newFn = function newFn() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var ret = fn.apply(this, args);
            var req = (args.length === 5 ? args[0] : next3last(args) || null);
            var res = (args.length === 5 ? args[1] : next2last(args) || null);
            var next = (args.length === 5 ? args[2] : last(args)) || noop;
            if (ret && ret.catch)
                ret.catch(function (err) {
                    if (errorhandler && req && res)
                        errorhandler(err, req, res, next);
                    else
                        next(err);
                });
            return ret;
        };
        Object.defineProperty(newFn, 'length', {
            value: fn.length,
            writable: false,
        });
        return copyFnProps(fn, newFn);
    }
    function patchRouterParam() {
        var originalParam = Router.prototype.constructor.param;
        Router.prototype.constructor.param = function param(name, fn) {
            fn = wrap(fn);
            return originalParam.call(this, name, fn);
        };
    }
    Object.defineProperty(Layer.prototype, 'handle', {
        enumerable: true,
        get: function () {
            return this.__handle;
        },
        set: function (fn) {
            fn = wrap(fn);
            this.__handle = fn;
        },
    });
    patchRouterParam();
}
exports.default = expressAsyncPatch;

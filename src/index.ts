import {Response, Request, NextFunction} from 'express';

const last:(arr:any[])=>any = (arr = []) => arr[arr.length - 1];
const next2last:(arr:any[])=>any = (arr = []) => arr[arr.length - 2];
const next3last:(arr:any[])=>any = (arr = []) => arr[arr.length - 3];
const noop:Function = Function.prototype;

function copyFnProps(oldFn:Function, newFn:Function):Function {
  Object.keys(oldFn).forEach((key) => {
    newFn[key] = oldFn[key];
  });
  return newFn;
}

export default function expressAsyncPatch(errorhandler?:(err:any,req:Request,res:Response,next?:NextFunction)=>void):void {
  const Layer = require('express/lib/router/layer');
  const Router = require('express/lib/router');
  function wrap(fn:Function) {
    const newFn = function newFn(...args:any[]) {
      const ret:Promise<any> = fn.apply(this, args);
      const req:Request = (args.length === 5 ? args[0] : next3last(args) || null);
      const res:Response = (args.length === 5 ? args[1] : next2last(args) || null);
      const next = (args.length === 5 ? args[2] : last(args)) || noop;
      if (ret && ret.catch) ret.catch((err:any) => {
          if(errorhandler && req && res) errorhandler(err,req,res,next);
          else next(err)
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
    const originalParam = Router.prototype.constructor.param;
    Router.prototype.constructor.param = function param(name, fn) {
      fn = wrap(fn);
      return originalParam.call(this, name, fn);
    };
  }

  Object.defineProperty(Layer.prototype, 'handle', {
    enumerable: true,
    get() {
      return this.__handle;
    },
    set(fn) {
      fn = wrap(fn);
      this.__handle = fn;
    },
  });

  patchRouterParam();
}
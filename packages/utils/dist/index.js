(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["iacg-monitor"] = {}));
})(this, (function (exports) { 'use strict';

  function curry(func, funcLen = 10) {
    let arr = [];
    return function _curry(...args) {
      arr.push(args);
      if (arr.length === funcLen) {
        const res = func.call(this, arr);
        return res
      } else {
        return _curry
      }
    }
  }

  const speedDelay = 1000; // load之后1s延迟
  // load最大等待10秒
  const maxLoadDelay = 10000;
  const maxLoad = () => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(1);
      }, maxLoadDelay);
    })
  };

  // 页面dom加载完成
  const domLoad = () => {
    return new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(1);
      } else {
        window.addEventListener('load', function () {
          resolve(1);
        });
      }
    })
  };
  // 页面load或最大等待时间10秒，触发回调
  const loadInterceptor = callback => {
    Promise.race([maxLoad(), domLoad()]).then(() => {
      callback();
    });
  };


  // 对数值向下取整
  const modifyFloor = (num = 0) => Math.floor(num);


  // 对每一个错误详情，生成一串编码
  const getErrorUid = (input) => {
    return window.btoa(unescape(encodeURIComponent(input)));
  };

  // 限制只追溯10个
  const STACKTRACE_LIMIT = 10;
  // 解析错误堆栈
  function parseStackFrames(error) {
    const { stack } = error;
    // 无 stack 时直接返回
    if (!stack) return [];
    const frames = [];
    for (const line of stack.split('\n').slice(1)) {
      const frame = parseStackLine(line);
      if (frame) {
        frames.push(frame);
      }
    }
    return frames.slice(0, STACKTRACE_LIMIT);
  }

  exports.curry = curry;
  exports.domLoad = domLoad;
  exports.getErrorUid = getErrorUid;
  exports.loadInterceptor = loadInterceptor;
  exports.modifyFloor = modifyFloor;
  exports.parseStackFrames = parseStackFrames;
  exports.speedDelay = speedDelay;

}));

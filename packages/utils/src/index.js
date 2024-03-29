export function curry(func, funcLen = 10) {
  let arr = []
  return function _curry(...args) {
    arr.push(args)
    if (arr.length === funcLen) {
      const res = func.call(this, arr)
      return res
    } else {
      return _curry
    }
  }
}

export const speedDelay = 1000; // load之后1s延迟
// load最大等待10秒
const maxLoadDelay = 10000
const maxLoad = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(1)
    }, maxLoadDelay)
  })
}

// 页面dom加载完成
export const domLoad = () => {
  return new Promise(resolve => {
    if (document.readyState === 'complete') {
      resolve(1)
    } else {
      window.addEventListener('load', function () {
        resolve(1)
      })
    }
  })
}
// 页面load或最大等待时间10秒，触发回调
export const loadInterceptor = callback => {
  Promise.race([maxLoad(), domLoad()]).then(() => {
    callback()
  })
}


// 对数值向下取整
export const modifyFloor = (num = 0) => Math.floor(num)


// 对每一个错误详情，生成一串编码
export const getErrorUid = (input) => {
  return window.btoa(unescape(encodeURIComponent(input)));
};

// 限制只追溯10个
const STACKTRACE_LIMIT = 10;
// 解析错误堆栈
export function parseStackFrames(error) {
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
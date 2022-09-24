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

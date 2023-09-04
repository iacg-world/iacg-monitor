import {
  sendError,
} from '@iacg-monitor/collect'
import { parseStackFrames } from '@iacg-monitor/utils';


// 获取报错组件名
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, '');
const ROOT_COMPONENT_NAME = '<Root>';
const ANONYMOUS_COMPONENT_NAME = '<Anonymous>';
export const formatComponentName = (vm, includeFile) => {
  if (!vm) {
    return ANONYMOUS_COMPONENT_NAME;
  }
  if (vm.$root === vm) {
    return ROOT_COMPONENT_NAME;
  }
  const options = vm.$options;
  let name = options.name || options._componentTag;
  const file = options.__file;
  if (!name && file) {
    const match = file.match(/([^/\\]+)\.vue$/);
    if (match) {
      name = match[1];
    }
  }
  return (
    (name ? `<${classify(name)}>` : ANONYMOUS_COMPONENT_NAME) + (file && includeFile !== false ? ` at ${file}` : '')
  );
};
// 只需要在外部把初始化好的 Vue 对象传入即可
export const initVueError = (app) => {
  app.config.errorHandler = (err, vm, info) => {
    const componentName = formatComponentName(vm, false);
    const exception = {

      // 错误信息
      message: {
        ...err.message,
        componentName
      },
      // 错误类型
      type: err.name,
      // 解析后的错误堆栈
      stack: {
        frames: parseStackFrames(err),
      },
    };
    sendError(exception);
  };
};


export const initError = () => {
    try {
      window.onerror = function (errMsg, file, line, col, err) {
        const stack = err.stack
        const message = err.message
        sendError({ stack, message, type: 'script' })
      }
      
      window.onunhandledrejection = function (e) {
        const stack = e.reason.stack
        const message = e.reason.message
        sendError({ stack, message, type: 'promise' })
      }
      // 监听Vue报错
      if (window.Vue && window.Vue.config) {
        window.Vue.config.errorHandler = function () {
          setTimeout(() => {
            const stack = e.reason.stack
            const message = e.reason.message
            sendError({ stack, message, type: 'vue' })
          });
      }
      }
    } catch (err) {
        const stack = err.stack
        const message = err.message
        sendError({ stack, message, type: '' })
    }
};

export default class ErrorPlugin {
  constructor() {
    this.customApis= {
      initVueError
    }
    this.init = initError
  }
}
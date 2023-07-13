import {
  sendError,
} from './collect'

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

import {
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
  sendClick,
  sendStayTime,
  sendError,
  sendPerf,
} from './collect'
import { upload } from './upload'

// 自动监听曝光事件
window.addEventListener('load', function() {
  collectAppear();
});

// 全局监听点击事件
!window.__DisableClickMonitor &&
  window.addEventListener('click', function (e) {
    const className = e.target.className
    if (className) {
      sendClick({ target: className })
    }
  })

// 自动监听停留时长
window.addEventListener('load', function (e) {
  window.__IacgMonitor_ENTER_TIME = new Date().getTime()
})

window.addEventListener('beforeunload', function (e) {
  if (window.__IacgMonitor_ENTER_TIME) {
    window.__IacgMonitor_LEAVE_TIME = new Date().getTime()
    const stayTime =
      window.__IacgMonitor_LEAVE_TIME - window.__IacgMonitor_ENTER_TIME
    console.log(
      'window.__IacgMonitor_LEAVE_TIME',
      window.__IacgMonitor_LEAVE_TIME,
    )
    sendStayTime({ stayTime })
  }
})

let fp = 0 // first-paint
let fcp = 0 // first-contentful-paint
let lcp = 0 // largest-contentful-paint
function callback(perf) {
  perf.getEntries().forEach(timing => {
    console.log(timing)
    if (timing.name === 'first-paint') {
      fp = timing.startTime
    } else if (timing.name === 'first-contentful-paint') {
      fcp = timing.startTime
    } else if (timing.entryType === 'largest-contentful-paint') {
      lcp = timing.startTime
    }
    // if (timing.entryType === 'navigation') {
    //   const dns = timing.domainLookupEnd - timing.domainLookupStart;
    //   const tcp = timing.connectEnd - timing.connectStart;
    //   const http = timing.responseEnd - timing.requestStart;
    //   const dom = timing.domComplete - timing.domInteractive;
    //   const load = timing.loadEventEnd - timing.loadEventStart;
    //   console.log('dns', dns);
    //   console.log('tcp', tcp);
    //   console.log('http', http);
    //   console.log('dom', dom);
    //   console.log('load', load);
    // }
  })
  console.log('fp', fp)
  console.log('fcp', fcp)
  console.log('lcp', lcp)
  sendPerf({
    fp,
    fcp,
    lcp,
  })
}

const observer = new PerformanceObserver(callback)
observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint'],
})

window.onerror = function (errMsg, file, line, col, err) {
  const stack = err.stack
  const message = err.message
  console.log(stack, message)
  sendError({ stack, message, type: 'script' })
}

window.onunhandledrejection = function (e) {
  const stack = e.reason.stack
  const message = e.reason.message
  console.log(stack, message)
  sendError({ stack, message, type: 'promise' })
}

window.IacgMonitor = {
  upload,
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
  sendClick,
  sendStayTime,
  sendError,
  sendPerf,
}

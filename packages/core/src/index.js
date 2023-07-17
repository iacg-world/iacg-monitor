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
} from '@iacg-monitor/collect'
import { initError, initVueError } from '@iacg-monitor/error';
import { initPerf } from '@iacg-monitor/perf';
import { upload } from '@iacg-monitor/upload'

// 自动监听曝光事件
window.addEventListener('load', function() {
  collectAppear();
  sendPV();
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

initPerf()
initError()

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
  initVueError
}
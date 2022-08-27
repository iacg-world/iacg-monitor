import {
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
  sendClick,
  sendStayTime
} from './collect'
import { upload } from './upload'

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
  window.__IacgCliMonitor_ENTER_TIME = new Date().getTime()
})

window.addEventListener('beforeunload', function (e) {
  if (window.__IacgCliMonitor_ENTER_TIME) {
    window.__IacgCliMonitor_LEAVE_TIME = new Date().getTime()
    const stayTime =
      window.__IacgCliMonitor_LEAVE_TIME - window.__IacgCliMonitor_ENTER_TIME
    console.log(
      'window.__IacgCliMonitor_LEAVE_TIME',
      window.__IacgCliMonitor_LEAVE_TIME,
    )
    sendStayTime({ stayTime })
  }
})

window.IacgCliMonitor = {
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
}

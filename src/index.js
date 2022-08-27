import {
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
  sendClick,
} from './collect'
import { upload } from './upload'

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
}

// 全局监听点击事件
!window.__DisableClickMonitor &&
  window.addEventListener('click', function (e) {
    const className = e.target.className
    if (className) {
      sendClick({ target: className })
    }
  })

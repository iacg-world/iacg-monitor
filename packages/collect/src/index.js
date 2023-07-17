import qs from 'qs'

import { upload } from '@iacg-monitor/upload'

// 参数创建前
let beforeCreateParams
// 上报日志前
let beforeUpload
// 上报日志后
let afterUpload
// 异常处理
let onError = function (e) {
  console.error(e)
}

export function registerBeforeCreateParams(fn) {
  beforeCreateParams = fn
}

export function registerBeforeUpload(fn) {
  beforeUpload = fn
}

export function registerAfterUpload(fn) {
  afterUpload = fn
}

export function registerOnError(fn) {
  onError = fn
}

/**
 * 采集页面的基本信息
 * @export
 */
function collect(customData, eventType, isSendBeacon = false, event) {
  let appId,
    pageId,
    modId = '',
    timestamp,
    ua,
    currentUrl
  beforeCreateParams && beforeCreateParams()
  const metaList = document.getElementsByTagName('meta')
  for (let i = 0; i < metaList.length; i++) {
    const meta = metaList[i]
    if (meta.getAttribute('iacg-app-id')) {
      appId = meta.getAttribute('iacg-app-id')
    }
  }
  const body = document.body
  pageId = body.getAttribute('iacg-page-id')
  if (!appId || !pageId) {
    return
  }
  if (event) {
    const dom = event.target
    modId = dom.getAttribute('iacg-mod-id')
    console.log('modId', modId)
  }

  timestamp = new Date().getTime()
  ua = window.navigator.userAgent
  currentUrl = window.location.href
  const params = {
    appId,
    pageId,
    modId,
    timestamp,
    ua,
    url: currentUrl,
    args: JSON.stringify(customData),
  }
  let data = qs.stringify(params)
  if (beforeUpload) {
    data = beforeUpload(data)
  }
  // 3.调用日志上报API
  let url, uploadData
  try {
    // throw 'error'
    const ret = upload(data, { eventType }, isSendBeacon)
    url = ret.url
    uploadData = ret.data
  } catch (e) {
    onError(e)
  } finally {
    afterUpload && afterUpload(url, uploadData)
  }
}

let requestIdleCallbackId = null
function asyncCollect() {
  requestIdleCallbackId = window.requestIdleCallback(
    () => {
      collect(...arguments)
    },
    { timeout: 3000 },
  )
}

function batchCollect(collectionList) {
  collectionList.forEach(args => {
    // console.log(...args);
    asyncCollect(...args)
  })
}

window.onunload = () => {
  window.cancelIdleCallback(requestIdleCallbackId)
}

/**
 * 曝光逻辑
 */
export function collectAppear() {
  const appearEvent = new CustomEvent('onAppear')
  const disappearEvent = new CustomEvent('onDisappear')
  let ob
  if (window.IacgMonitorObserver) {
    ob = window.IacgMonitorObserver // 只实例化一次
  } else {
    ob = new IntersectionObserver(function (e) {
      e.forEach(d => {
        if (d.intersectionRatio > 0) {
          console.log(d.target.className + ' appear')
          d.target.dispatchEvent(appearEvent)
        } else {
          console.log(d.target.className + ' disappear')
          d.target.dispatchEvent(disappearEvent)
        }
      })
    })
  }
  // 维护监听dom队列，批量上传
  let obList = []
  const appear = document.querySelectorAll('[appear]') // 找到添加了appear属性的DOM标签
  for (let i = 0; i < appear.length; i++) {
    if (!obList.includes(appear[i])) {
      ob.observe(appear[i])
      obList.push(appear[i])
    }
  }
  window.IacgMonitorObserver = ob
  window.IacgMonitorObserverList = obList
}
// 发送PV日志
export function sendPV() {
  collect({}, 'PV', true)
}
// 上报曝光埋点
export function sendExp(data = {}, e) {
  collect(data, 'EXP', false, e)
}

// 上报点击埋点
export function sendClick(data = {}, e) {
  // collect(data, 'CLICK', true, e)
  asyncCollect(data, 'CLICK', true, e)
}

// 上报停留时长埋点
export function sendStayTime(data = {}) {
  collect(data, 'STAY', true)
}

// 上报性能指标
export function sendPerf(data = {}) {
  collect(data, 'PERF', true)
}

// 上报异常监控
export function sendError(data = {}) {
  collect(data, 'ERROR', true)
}

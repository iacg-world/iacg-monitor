import qs from 'qs'

import { upload } from './upload'

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
export function collect(customData, eventType, isSendBeacon = false, event) {
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
  console.log(appId, pageId, timestamp, ua)
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
  console.log(data)
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

// 发送PV日志
export function sendPV() {
  collect({}, 'PV')
}

export default {}

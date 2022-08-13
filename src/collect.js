import qs from 'qs'

import { upload } from './upload'

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
  // 3.调用日志上报API
  upload(data, { eventType }, isSendBeacon)
}

// 发送PV日志
export function sendPV() {
  collect({}, 'PV')
}

export default {}

import UUID from 'uuidjs'

/**
 * 日志数据上报
 *
 * @param {*} data 上报参数
 * @param {*} options 附加属性
 * event-type：PV、EXP、CLICK、CUSTOM
 *
 */
export function upload(data, options = {}, isSendBeacon = false) {
  // 获取event_type
  const { eventType = 'PV' } = options
  // 获取user_id和visitor_id
  let userId, visitorId
  userId = window.localStorage.getItem('user_id')
  visitorId = window.localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = UUID.generate()
    window.localStorage.setItem('visitor_id', visitorId)
  }
  if (!userId) {
    userId = visitorId
  }
  const params =
    data +
    '&eventType=' +
    eventType +
    '&user_id=' +
    userId +
    '&visitor_id=' +
    visitorId
  const src = 'http://iacg:7001/monitor/upload?' + params
  if (!isSendBeacon) {
    let img = new Image()
    img.src = src
    img = null // 内存释放
  } else {
    window.navigator.sendBeacon(src)
  }
  return {
    url: src,
    data: {
      params,
    },
  }
}

export default {}

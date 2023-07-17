(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('uuidjs')) :
  typeof define === 'function' && define.amd ? define(['exports', 'uuidjs'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["iacg-monitor"] = {}, global.UUID));
})(this, (function (exports, UUID) { 'use strict';

  /**
   * 日志数据上报
   *
   * @param {*} data 上报参数
   * @param {*} options 附加属性
   * event-type：PV、EXP、CLICK、CUSTOM
   *
   */
  function upload(data, options = {}, isSendBeacon = false) {
    // 获取event_type
    const { eventType = 'PV' } = options;
    // 获取user_id和visitor_id
    let userId, visitorId;
    userId = window.localStorage.getItem('user_id');
    visitorId = window.localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = UUID.generate();
      window.localStorage.setItem('visitor_id', visitorId);
    }
    if (!userId) {
      userId = visitorId;
    }
    const params =
      data +
      '&eventType=' +
      eventType +
      '&user_id=' +
      userId +
      '&visitor_id=' +
      visitorId;
    const src = 'https://api-sc.lc404.cn/api/monitor/upload?' + params;
    if (!isSendBeacon) {
      let img = new Image();
      img.src = src;
      img = null; // 内存释放
    } else {
      window.navigator.sendBeacon(src);
    }
    return {
      url: src,
      data: {
        params,
      },
    }
  }

  var index = {};

  exports.default = index;
  exports.upload = upload;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

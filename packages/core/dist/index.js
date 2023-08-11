(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('@iacg-monitor/collect'), require('@iacg-monitor/upload')) :
  typeof define === 'function' && define.amd ? define(['@iacg-monitor/collect', '@iacg-monitor/upload'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["iacg-monitor"] = factory(global.collect, global.upload));
})(this, (function (collect, upload) { 'use strict';

  class MonitorCore {
    constructor(options = {projectName: 'input your project name'}) {
      this.projectName = options.projectName;
      this.IacgMonitor = {
        upload: upload.upload,
        sendPV: collect.sendPV,
        registerBeforeCreateParams: collect.registerBeforeCreateParams,
        registerBeforeUpload: collect.registerBeforeUpload,
        registerAfterUpload: collect.registerAfterUpload,
        registerOnError: collect.registerOnError,
        collectAppear: collect.collectAppear,
        sendExp: collect.sendExp,
        sendClick: collect.sendClick,
        sendStayTime: collect.sendStayTime,
        sendError: collect.sendError,
        sendPerf: collect.sendPerf,
      };
    }
    init() {
      // 自动监听曝光事件
      window.addEventListener('load', function () {
        collect.collectAppear();
        collect.sendPV();
      });

      // 全局监听点击事件
      !window.__DisableClickMonitor &&
        window.addEventListener('click', function (e) {
          const className = e.target.className;
          if (className) {
            collect.sendClick({ target: className });
          }
        });

      // 自动监听停留时长
      window.addEventListener('load', function (e) {
        window.__IacgMonitor_ENTER_TIME = new Date().getTime();
      });

      window.addEventListener('beforeunload', function (e) {
        if (window.__IacgMonitor_ENTER_TIME) {
          window.__IacgMonitor_LEAVE_TIME = new Date().getTime();
          const stayTime =
            window.__IacgMonitor_LEAVE_TIME - window.__IacgMonitor_ENTER_TIME;
          console.log(
            'window.__IacgMonitor_LEAVE_TIME',
            window.__IacgMonitor_LEAVE_TIME,
          );
          collect.sendStayTime({ stayTime });
        }
      });
    }
    use(Plugin) {
      const plugin = new Plugin();
      plugin.init();
      if (plugin.customApis) {
        this.IacgMonitor = {
          ...this.IacgMonitor,
          ...(plugin.customApis && plugin.customApis)
        };
      }
    }
  }

  return MonitorCore;

}));

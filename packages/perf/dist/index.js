(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@iacg-monitor/collect'), require('@iacg-monitor/utils')) :
  typeof define === 'function' && define.amd ? define(['exports', '@iacg-monitor/collect', '@iacg-monitor/utils'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["iacg-monitor"] = {}, global.collect, global.utils));
})(this, (function (exports, collect, utils) { 'use strict';

  // firstScreenPaint为首屏加载时间的变量
  let firstScreenPaint = 0;
  // 页面是否渲染完成
  let isOnLoaded = false;
  let timer;
  let observer;
  let entries = [];
  let navigationStart =  performance.timeOrigin || performance.timing.navigationStart;
  function getRenderTime() {
    let startTime = 0;
    entries.forEach((entry) => {
      if (entry.startTime > startTime) {
        startTime = entry.startTime;
      }
    });
    // performance.timing.navigationStart 页面的起始时间
    return utils.modifyFloor(startTime - navigationStart);
  }
  const checkDOMChange = (callback) => {
    cancelAnimationFrame(timer);
    timer = requestAnimationFrame(() => {
      if (document.readyState === 'complete') {
        isOnLoaded = true;
      }
      if (isOnLoaded) {
        // 取消监听
        observer && observer.disconnect();

        // document.readyState === 'complete'时，计算首屏渲染时间
        firstScreenPaint = getRenderTime();
        entries = null;

        // 执行用户传入的callback函数
        callback && callback(firstScreenPaint);
      } else {
        checkDOMChange(callback);
      }
    });
  };

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  // dom 对象是否在屏幕内
  function isInScreen(dom) {
    const rectInfo = dom.getBoundingClientRect();
    if (rectInfo.left < viewportWidth && rectInfo.top < viewportHeight) {
      return true;
    }
    return false;
  }

  // 外部通过callback 拿到首屏加载时间
  const observeFirstScreenPaint = (callback) => {
    const ignoreDOMList = ['STYLE', 'SCRIPT', 'LINK'];
    observer = new window.MutationObserver((mutationList) => {
      checkDOMChange(callback);
      const entry = { children: [] };
      for (const mutation of mutationList) {
        if (mutation.addedNodes.length && isInScreen(mutation.target)) {
          for (const node of mutation.addedNodes) {
            // 忽略掉以上标签的变化
            if (node.nodeType === 1 && !ignoreDOMList.includes(node.tagName) && isInScreen(node)) {
              entry.children.push(node);
            }
          }
        }
      }

      if (entry.children.length) {
        entries.push(entry);
        entry.startTime = new Date().getTime();
      }
    });
    observer.observe(document, {
      childList: true, // 监听添加或删除子节点
      subtree: true, // 监听整个子树
      characterData: true, // 监听元素的文本是否变化
      attributes: true // 监听元素的属性是否变化
    });

  };

  let navigationEntry;
  /**
   * 导航开始到各个指标点时间的间隔
   * @returns {{entryType: string, startTime: number}}
   */
  const getNavigationEntryFromPerformanceTiming = () => {
    try {
      if (navigationEntry) {
        return navigationEntry
      }

      if (window && window.performance) {
        if (
          window.performance.getEntriesByType &&
          window.performance.getEntriesByType('navigation') &&
          window.performance.getEntriesByType('navigation')[0]
        ) {
          // performance.getEntriesByType兼容性：IE10及以上，safari 11及以上，安卓 5及以上。
          navigationEntry = window.performance.getEntriesByType('navigation')[0];
        } else {
          const timing = window.performance.timing; // performance.timing兼容性：IE9及以上，safari 9及以上，安卓 4及以上。
          const obj = {
            entryType: 'navigation',
            startTime: 0,
          };
          for (const key in timing) {
            if (key !== 'navigationStart' && key !== 'toJSON') {
              obj[key] = Math.max(timing[key] - timing.navigationStart, 0);
            }
          }
          navigationEntry = obj;
        }
      } else {
        navigationEntry = {};
      }
      return navigationEntry
    } catch (err) {
      throw err
    }
  };

  /**
   * 首字节导航请求时间,TTFB：在浏览器切换页面时创建，从导航开始到该请求返回 HTML
   * @returns {number}
   */
  const getTTFB = () => {
    try {
      return utils.modifyFloor(getNavigationEntryFromPerformanceTiming().responseStart)
    } catch (err) {
      throw err
    }
  };

  /**
   * DOM结构结束解析,开始加载内嵌资源
   * @returns {number}
   */
  const getReady = () => {
    try {
      return utils.modifyFloor(getNavigationEntryFromPerformanceTiming().domInteractive)
    } catch (err) {
      throw err
    }
  };

  /**
   * 文档解析完成
   * @returns {number}
   */
  const getLoaded = () => {
    try {
      return utils.modifyFloor(getNavigationEntryFromPerformanceTiming().domComplete)
    } catch (err) {
      throw err
    }
  };
  /**
   * 页面资源列表
   */
  const getPerformanceEntryList = () => {
    try {
      if (window.performance && window.performance.getEntries) {
        const EntryList = window.performance.getEntries();
        const resourceInfo = {
          js: [],
          css: [],
          cssInline: [],
          img: [],
        };
        const alias = {
          script: 'js',
          link: 'css',
          css: 'cssInline',
          img: 'img',
        };
        EntryList.forEach(({ initiatorType, name, transferSize, duration }) => {
          const type = alias[initiatorType];
          if (type && duration > 1) {
            const infoType = type;
            resourceInfo[infoType].push({
              name,
              size: transferSize,
              time: utils.modifyFloor(duration)
            });
          }
        });
        return resourceInfo
      }
    } catch (err) {
      throw err
    }
  };
  /**
   * PerformanceObserver 监听性能类型。兼容性：IE不支持，safari 12.1及以上，安卓 5及以上
   * @param type
   * @param callback
   */
  const observe = (type, callback) => {
    try {
      const PerformanceObserver = window.PerformanceObserver;
      if (
        PerformanceObserver &&
        PerformanceObserver.supportedEntryTypes &&
        PerformanceObserver.supportedEntryTypes.indexOf(type) !== -1
      ) {
        const po = new PerformanceObserver(l => callback(l.getEntries()));
        po.observe({ type, buffered: true }); // type：观察的类型；buffered: 是否应将缓冲的条目排队到观察者的缓冲区中。
        return po
      }
    } catch {
      // 根据w3c结论，observe的参数entryTypes和type不可同时出现，但部分浏览器无entryTypes参数会报错。所以忽略这里报错
      // https://github.com/w3c/performance-timeline/pull/112
    }
    return false
  };

  /**
   * FCP时间
   * @returns {Promise<number>}
   */
  const getFCP = () => {
    return new Promise(resolve => {
      const entryHandler = entryList => {
        const timeList = [];
        entryList.forEach(({ name, startTime }) => {
          if (name === 'first-contentful-paint') {
            timeList.push(Math.floor(startTime));
          }
        });
        resolve(timeList.pop() || 0);
      };
      const po = observe('paint', entryHandler);
      if (!po) {
        resolve(0);
      }
    })
  };

  /**
   * LCP时间
   * @returns {Promise<number>}
   */
  const getLCP = () => {
    return new Promise(resolve => {
      const entryHandler = entryList => {
        const timeList = [];
        entryList.forEach(({ startTime }) => {
          timeList.push(Math.floor(startTime));
        });
        resolve(timeList.pop() || 0);
      };
      const po = observe('largest-contentful-paint', entryHandler);
      if (!po) {
        resolve(0);
      }
    })
  };

  /**
   * FID时间， 用户首次点击时间
   * @returns {Promise<number>}
   */
  const getFID = () => {
    return new Promise(resolve => {
      try {
        const entryHandler = entryList => {
          const timeList = [];
          entryList.forEach(({ duration }) => {
            timeList.push(Math.floor(duration));
          });
          resolve(timeList.pop() || 0);
        };
        const po = observe('first-input', entryHandler);
        if (!po) {
          resolve(0);
        }
      } catch (err) {}
    })
  };
  /**
   * FP时间
   * @returns {Promise<number>}
   */
  const getFP = () => {
    return new Promise(resolve => {
      try {
        const entryHandler = entryList => {
          const timeList = [];
          entryList.forEach(({ duration }) => {
            timeList.push(Math.floor(duration));
          });
          resolve(timeList.pop() || 0);
        };
        const po = observe('first-paint', entryHandler);
        if (!po) {
          resolve(0);
        }
      } catch (err) {}
    })
  };
  /**
   * navigation时间
   * @returns {Promise<number>}
   */
  const getNavigation = () => {
    return new Promise(resolve => {
      try {
        const d = {
          dns: 0,
          tcp: 0,
          http: 0,
          dom: 0,
          load: 0,
        };
        const entryHandler = entryList => {
          const navigationObjList = [];
          entryList.forEach(entry => {
            const navigationObj = {
              dns: entry.domainLookupEnd - entry.domainLookupStart,
              tcp: entry.connectEnd - entry.connectStart,
              http: entry.responseEnd - entry.requestStart,
              dom: entry.domComplete - entry.domInteractive,
              load: entry.loadEventEnd - entry.loadEventStart,
            };
            navigationObjList.push(navigationObj);
          });

          resolve(navigationObjList.pop() || d);
        };
        const po = observe('navigation', entryHandler);
        if (!po) {
          resolve(d);
        }
      } catch (err) {}
    })
  };

  const initPerf = async() => {
    observeFirstScreenPaint((time) => {
      collect.sendPerf({
        fsp: time > 0 ? time: getLoaded(),
      });
     });
    getFID().then(time => {
      collect.sendPerf({
        fid: time,
      });
    });

    utils.loadInterceptor(async () => {
      const ttfb = getTTFB();
      const ready = getReady();
      const loaded = getLoaded();
      const entryMap = getPerformanceEntryList();


      const fp = await getFP();
      const fcp = await getFCP();
      const lcp = await getLCP();
      const navigationObj = await getNavigation();
      collect.sendPerf({
        fp,
        fcp,
        lcp,
        ...navigationObj,
        ttfb,
        ready,
        loaded,
        entryMap,
      });
    });
  };

  class PerfPlugin {
    constructor() {
      this.init = initPerf;
    }
  }

  exports.default = PerfPlugin;
  exports.getNavigationEntryFromPerformanceTiming = getNavigationEntryFromPerformanceTiming;
  exports.initPerf = initPerf;
  exports.observe = observe;

  Object.defineProperty(exports, '__esModule', { value: true });

}));

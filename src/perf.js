import { sendError, sendPerf } from './collect'
import { loadInterceptor, speedDelay } from './utils'
let navigationEntry
/**
 * 导航开始到各个指标点时间的间隔
 * @returns {{entryType: string, startTime: number}}
 */
export const getNavigationEntryFromPerformanceTiming = () => {
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
        navigationEntry = window.performance.getEntriesByType('navigation')[0]
      } else {
        const timing = window.performance.timing // performance.timing兼容性：IE9及以上，safari 9及以上，安卓 4及以上。
        const obj = {
          entryType: 'navigation',
          startTime: 0,
        }
        for (const key in timing) {
          if (key !== 'navigationStart' && key !== 'toJSON') {
            obj[key] = Math.max(timing[key] - timing.navigationStart, 0)
          }
        }
        navigationEntry = obj
      }
    } else {
      navigationEntry = {}
    }
    return navigationEntry
  } catch (err) {
    throw err
  }
}

// 对数值向下取整
const modifyFloor = (num = 0) => Math.floor(num)
/**
 * TTFB时间
 * @returns {number}
 */
const getTTFB = () => {
  try {
    return modifyFloor(getNavigationEntryFromPerformanceTiming().responseStart)
  } catch (err) {
    throw err
  }
}

/**
 * DOM结构结束解析,开始加载内嵌资源
 * @returns {number}
 */
const getReady = () => {
  try {
    return modifyFloor(getNavigationEntryFromPerformanceTiming().domInteractive)
  } catch (err) {
    throw err
  }
}

/**
 * 文档解析完成
 * @returns {number}
 */
const getLoaded = () => {
  try {
    return modifyFloor(getNavigationEntryFromPerformanceTiming().domComplete)
  } catch (err) {
    throw err
  }
}
/**
 * 页面资源列表
 */
const getPerformanceEntryList = () => {
  try {
    if (window.performance && window.performance.getEntries) {
      const EntryList = window.performance.getEntries()
      const resourceInfo = {
        js: [],
        css: [],
        cssInline: [],
        img: [],
      }
      const alias = {
        script: 'js',
        link: 'css',
        css: 'cssInline',
        img: 'img',
      }
      EntryList.forEach(({ initiatorType, name, transferSize, duration }) => {
        const type = alias[initiatorType]
        if (type && duration > 1) {
          const infoType = type
          resourceInfo[infoType].push({
            name,
            size: transferSize,
            time: duration,
          })
        }
      })
      return resourceInfo
    }
  } catch (err) {
    throw err
  }
}
/**
 * PerformanceObserver 监听性能类型。兼容性：IE不支持，safari 12.1及以上，安卓 5及以上
 * @param type
 * @param callback
 */
export const observe = (type, callback) => {
  try {
    const PerformanceObserver = window.PerformanceObserver
    if (
      PerformanceObserver &&
      PerformanceObserver.supportedEntryTypes &&
      PerformanceObserver.supportedEntryTypes.indexOf(type) !== -1
    ) {
      const po = new PerformanceObserver(l => callback(l.getEntries()))
      po.observe({ type, buffered: true }) // type：观察的类型；buffered: 是否应将缓冲的条目排队到观察者的缓冲区中。
      return po
    }
  } catch {
    // 根据w3c结论，observe的参数entryTypes和type不可同时出现，但部分浏览器无entryTypes参数会报错。所以忽略这里报错
    // https://github.com/w3c/performance-timeline/pull/112
  }
  return false
}

/**
 * FCP时间
 * @returns {Promise<number>}
 */
const getFCP = () => {
  return new Promise(resolve => {
    const entryHandler = entryList => {
      const timeList = []
      entryList.forEach(({ name, startTime }) => {
        if (name === 'first-contentful-paint') {
          timeList.push(Math.floor(startTime))
        }
      })
      resolve(timeList.pop() || 0)
    }
    const po = observe('paint', entryHandler)
    if (!po) {
      resolve(0)
    }
  })
}

/**
 * LCP时间
 * @returns {Promise<number>}
 */
const getLCP = () => {
  return new Promise(resolve => {
    const entryHandler = entryList => {
      const timeList = []
      entryList.forEach(({ startTime }) => {
        timeList.push(Math.floor(startTime))
      })
      resolve(timeList.pop() || 0)
    }
    const po = observe('largest-contentful-paint', entryHandler)
    if (!po) {
      resolve(0)
    }
  })
}

/**
 * FID时间
 * @returns {Promise<number>}
 */
const getFID = () => {
  return new Promise(resolve => {
    try {
      const entryHandler = entryList => {
        const timeList = []
        entryList.forEach(({ duration }) => {
          timeList.push(Math.floor(duration))
        })
        resolve(timeList.pop() || 0)
      }
      const po = observe('first-input', entryHandler)
      if (!po) {
        resolve(0)
      }
    } catch (err) {}
  })
}
/**
 * FP时间
 * @returns {Promise<number>}
 */
const getFP = () => {
  return new Promise(resolve => {
    try {
      const entryHandler = entryList => {
        const timeList = []
        entryList.forEach(({ duration }) => {
          timeList.push(Math.floor(duration))
        })
        resolve(timeList.pop() || 0)
      }
      const po = observe('first-paint', entryHandler)
      if (!po) {
        resolve(0)
      }
    } catch (err) {}
  })
}
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
      }
      const entryHandler = entryList => {
        const navigationObjList = []
        entryList.forEach(entry => {
          const navigationObj = {
            dns: entry.domainLookupEnd - entry.domainLookupStart,
            tcp: entry.connectEnd - entry.connectStart,
            http: entry.responseEnd - entry.requestStart,
            dom: entry.domComplete - entry.domInteractive,
            load: entry.loadEventEnd - entry.loadEventStart,
          }
          navigationObjList.push(navigationObj)
        })

        resolve(navigationObjList.pop() || d)
      }
      const po = observe('navigation', entryHandler)
      if (!po) {
        resolve(d)
      }
    } catch (err) {}
  })
}

export const initPerf = () => {
  loadInterceptor(async () => {
    const ttfb = getTTFB()
    const ready = getReady()
    const loaded = getLoaded()
    const entryMap = getPerformanceEntryList();

    getFID().then(time => {
      sendPerf({
        fid: time,
      })
    })
    const fp = await getFP()
    const fcp = await getFCP()
    const lcp = await getLCP()
    const navigationObj = await getNavigation()
    sendPerf({
      fp,
      fcp,
      lcp,
      ...navigationObj,
      ttfb,
      ready,
      loaded,
      entryMap,
    })
  })
}

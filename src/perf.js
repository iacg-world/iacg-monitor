import {
  sendPerf,
} from './collect'
let fp = 0 // first-paint
let fcp = 0 // first-contentful-paint
let lcp = 0 // largest-contentful-paint
let dns = 0
let tcp = 0
let http = 0
let dom = 0
let load = 0
function callback(perf) {
  perf.getEntries().forEach(entry => {
    console.log('entry: ', entry)
    if (entry.name === 'first-paint') {
      fp = entry.startTime
    } else if (entry.name === 'first-contentful-paint') {
      fcp = entry.startTime
    } else if (entry.entryType === 'largest-contentful-paint') {
      lcp = entry.startTime
    }
    
    if (entry.entryType === 'navigation') {
      dns = entry.domainLookupEnd - entry.domainLookupStart;
      tcp = entry.connectEnd - entry.connectStart;
      http = entry.responseEnd - entry.requestStart;
      dom = entry.domComplete - entry.domInteractive;
      load = entry.loadEventEnd - entry.loadEventStart;
      // console.log('dns', dns);
      // console.log('tcp', tcp);
      // console.log('http', http);
      // console.log('dom', dom);
      // console.log('load', load);
    }
  })
  // console.log('fp', fp)
  // console.log('fcp', fcp)
  // console.log('lcp', lcp)
  sendPerf({
    fp,
    fcp,
    lcp,
    dns,
    tcp,
    http,
    dom,
    load,
  })
}

export const initPerf = () => {

  const observer = new PerformanceObserver(callback)
  observer.observe({
    entryTypes: ['paint', 'largest-contentful-paint', 'navigation', 'first-input'],
  })
}



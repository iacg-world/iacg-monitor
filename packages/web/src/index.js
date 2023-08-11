import IacgMonitor from '@iacg-monitor/core'
import ErrorPlugin from '@iacg-monitor/error'
import PerfPlugin from '@iacg-monitor/perf'

const monitor = new IacgMonitor()

monitor.use(ErrorPlugin)
monitor.use(PerfPlugin)

window.IacgMonitor = monitor.IacgMonitor
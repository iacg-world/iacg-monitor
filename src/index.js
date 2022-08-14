import {
  collect,
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
} from './collect'
import { upload } from './upload'

window.IacgCliMonitor = {
  collect,
  upload,
  sendPV,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
  sendExp,
}

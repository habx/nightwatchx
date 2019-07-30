import EventEmitter from 'events'
import appendQuery from 'append-query'
import { FgBlue, log, Reset } from '../utils/console'

class GoTo extends EventEmitter {
  api: any

  command = (url: string, qa: boolean = true , callback?: () => void) => {
    const realUrl = qa ? appendQuery(url, { 'test-qa': new Date().getTime() }) : url
    log(`${FgBlue}➤${Reset} Switch url to ${realUrl}`)

    // TODO: inject document.onload code and create an element to wait for
    this.api.url(realUrl, () => {
      if (callback) {
        callback()
      }
      this.emit('complete')
    })
    return this
  }
}

module.exports = GoTo

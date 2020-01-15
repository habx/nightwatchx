import EventEmitter from 'events'

class WaitForUrlContains extends EventEmitter {
  api: any

  command = (
    value: string,
    timeout = this.api.globals.waitForConditionTimeout,
    callback?: () => void
  ) => {
    const startTime = Date.now()
    const retry = () => {
      if (Date.now().valueOf() - startTime.valueOf() > timeout) {
        this.emit('complete')
        this.api.assert.urlContains('contact')
        return callback()
      }
      const url = this.api.url()
      if (!url.includes(value)) {
        return setTimeout(retry, this.api.globals.waitForConditionPollInterval ?? 200)
      }
      this.emit('complete')
      return callback()
    }

    retry()

    return this
  }
}

module.exports = WaitForUrlContains

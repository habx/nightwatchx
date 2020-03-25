import EventEmitter from 'events'

class WaitForUrlContains extends EventEmitter {
  api: any

  command = (
    value: string,
    timeout = this.api.globals.waitForConditionTimeout,
    callback = () => {}
  ) => {
    const startTime = Date.now()
    const retry = async () => {
      if (Date.now().valueOf() - startTime.valueOf() > timeout) {
        this.emit('complete')
        this.api.assert.urlContains('contact')
        return callback()
      }

      const url: string = await new Promise((resolve) =>
        this.api.url(({ value }) => resolve(value as string))
      )
      if (!url.includes(value)) {
        return setTimeout(
          retry,
          this.api.globals.waitForConditionPollInterval ?? 200
        )
      }
      this.emit('complete')
      return callback()
    }

    retry()

    return this
  }
}

module.exports = WaitForUrlContains

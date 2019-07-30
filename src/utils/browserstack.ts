import { get } from 'lodash'
import { log, FgRed } from './console'
import { NightwatchBrowser } from '../types/nightwatch'

export const updateStatus = (browser: NightwatchBrowser) => new Promise(resolve => {
  if ((browser.currentTest.results.failed || browser.currentTest.results.errors) && !browser.globals.isLocal) {
    const caps = browser.options.desiredCapabilities
    const user = caps['browserstack.user']
    const key = caps['browserstack.key']
    const options = {
      host: 'www.browserstack.com',
      path: `/automate/sessions/${browser.globals.sessionid}.json`,
      method: 'PUT',
      auth: `${user}:${key}`,
      headers: { 'Content-Type': 'application/json' },
    }
    require('https')
      .request(options, function () { resolve() })
      .on('error', function (error) {
        log(FgRed, error)
        resolve()
      })
      .end(JSON.stringify({ status: 'error' }))
  } else {
    resolve()
  }
})

export const getInfos = (browser: NightwatchBrowser) => new Promise(resolve => {
  if (!browser.globals.isLocal) {
    const caps = browser.options.desiredCapabilities
    const user = caps['browserstack.user']
    const key = caps['browserstack.key']
    const options = {
      host: 'www.browserstack.com',
      path: `/automate/sessions/${browser.globals.sessionid}.json`,
      method: 'GET',
      auth: `${user}:${key}`,
      headers: { 'Content-Type': 'application/json' },
    }
    require('https')
      .request(options, res => {
        res.on('data', function (chunk) {
          try {
            const data = JSON.parse(chunk.toString())
            log(`🎥 browserstack report: ${get(data, 'automation_session.public_url')}`)
            browser.globals.browserstackLinks[browser.currentTest.module] = {
              ...get(browser.globals.browserstackLinks, browser.currentTest.module, {}),
              [get(browser, 'options.deviceName')]: get(data, 'automation_session.public_url'),
            }
          } catch (e) {
            console.log(e)
          } finally {
            resolve()
          }
        })
      })
      .on('error', function (error) {
        log(FgRed, error)
        resolve()
      })
      .end(JSON.stringify({ status: 'error' }))
  } else {
    resolve()
  }
})

export const preventIdleTimeout = (browser: NightwatchBrowser, message: string, ms = 1000): NodeJS.Timer => {
  let interval = null
  if (browser) {
    interval = setInterval(() => {
      browser.execute(`console.log("${message}")`)
    }, ms)
  }
  return interval
}

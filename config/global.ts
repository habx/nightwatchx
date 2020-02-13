import { get, max, min } from 'lodash'
import fetch from 'node-fetch'

import { NightwatchTestFunctions } from '../src/types/nightwatch'
import { getInfos, updateStatus } from '../src/utils/browserstack'
import { logDecorator, log } from '../src/utils/console'
import reporter from '../src/utils/reporter'
import { screenshotOnFail } from '../src/utils/screenshots'

const globals: NightwatchTestFunctions = {
  asyncHookTimeout: 60000,
  customReporterCallbackTimeout: 60000,
  reporter: async function(results, done) {
    await reporter(this, results)
    done()
  },
  beforeEach: async function(browser, done) {
    browser.globals.deviceName = get(browser, 'options.deviceName') || 'local'
    browser.globals.sessionid =
      get(browser, "capabilities['webdriver.remote.sessionid']") ||
      get(browser, 'sessionId')

    const deviceSize = get(browser, 'options.desiredCapabilities.resolution')
    if (deviceSize) {
      const realSize = deviceSize
        .split('x')
        .map(size => Number(size.replace('x', '')))
      await new Promise(resolve =>
        browser.resizeWindow(max(realSize), min(realSize), resolve)
      )
    }
    log(logDecorator.FgMagenta, `Running on ${browser.globals.deviceName} 🖥\n`)

    if (process.env.REPORT_ENDPOINT) {
      // Create report run
      await fetch(`${process.env.REPORT_ENDPOINT}/runs`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'x-habx-token': process.env.REPORT_TOKEN,
        },
        body: JSON.stringify({
          slug: browser.options.desiredCapabilities.name,
          device: browser.globals.deviceName,
          env: browser.globals.env,
          sessionId: browser.globals.sessionid,
        }),
      })
    }

    done()
  },
  afterEach: async function(browser, done) {
    await getInfos(browser)
    await screenshotOnFail(browser)
    await updateStatus(browser)

    if (process.env.REPORT_ENDPOINT) {
      let status = Object.values(globals.screenshots).some(
        ({ success }) => !success
      )
        ? 'diff'
        : 'ok'
      if (
        browser.currentTest.results.failed ||
        browser.currentTest.results.errors
      ) {
        status = 'error'
      }

      // Save report run
      await fetch(
        `${process.env.REPORT_ENDPOINT}/runs/${browser.globals.sessionid}`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            'x-habx-token': process.env.REPORT_TOKEN,
          },
          body: JSON.stringify({
            status,
            duration: browser.currentTest.results.time,
            properties: {
              test: browser.currentTest,
              failedImageUrl: browser.globals.failedImageUrl,
              screenshots: globals.screenshots,
            },
          }),
        }
      )
    }

    browser.end()
    done()
  },
}

module.exports = globals

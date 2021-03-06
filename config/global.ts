import { get, max, min } from 'lodash'
import fetch from 'node-fetch'

import { NightwatchTestFunctions } from '../src/types/nightwatch'
import { getInfos, updateStatus } from '../src/utils/browserstack'
import { logDecorator, log } from '../src/utils/console'
import reporter from '../src/utils/reporter'
import { getFileUrl } from '../src/utils/s3'
import { getRunPath, screenshotOnFail } from '../src/utils/screenshots'

const globals: NightwatchTestFunctions = {
  asyncHookTimeout: 60000 * 10,
  customReporterCallbackTimeout: 60000 * 5,
  reporter: async function(results, done) {
    await reporter(this, results)
    done()
  },
  beforeEach: async function(browser, done) {
    browser.globals.step = 1
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

    if (process.env.EXPORT_ENDPOINT) {
      // Create report run
      await fetch(`${process.env.EXPORT_ENDPOINT}/runs`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          ...JSON.parse(process.env.EXPORT_HEADERS),
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

    if (process.env.EXPORT_ENDPOINT) {
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
        `${process.env.EXPORT_ENDPOINT}/runs/${browser.globals.sessionid}`,
        {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            ...JSON.parse(process.env.EXPORT_HEADERS),
          },
          body: JSON.stringify({
            status,
            duration: Math.ceil(Number(browser.currentTest.results.time)),
            screenshotPath: getFileUrl(
              `${getRunPath(browser)}/scenario_failed.png`,
              60 * 60 * 24 * 365
            ),
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

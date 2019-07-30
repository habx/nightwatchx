import mergeImg from 'merge-img'
import Jimp from 'jimp'
import { get } from 'lodash'
import { getFileUrl, uploadFile } from './s3'
import { log } from './console'
import { NightwatchBrowser } from '../types/nightwatch'

export const getRunPath = (browser: NightwatchBrowser): string => `runs/${get(browser.globals, 'env')}/${get(browser.globals, 'slug')}/${get(browser, 'options.deviceName', 'default')}`
export const getRefPath = (browser: NightwatchBrowser): string => `ref/${get(browser.globals, 'env')}/${get(browser.globals, 'slug')}/${get(browser, 'options.deviceName', 'default')}`

export const getViewportDimensions = (browser: NightwatchBrowser): Promise<{ width: number, height: number}> => new Promise(async resolveAll => {
  const height = await new Promise<number>(resolve => browser.execute('return window.innerHeight', [], ({ value }) => resolve(value as number)))
  const width = await new Promise<number>(resolve => browser.execute('return window.innerWidth',[], ({ value }) => resolve(value as number)))
  resolveAll({ width, height })
})

export const screenshotOnFail = (browser: NightwatchBrowser) => new Promise(async resolve => {
  if ((browser.currentTest.results.failed || browser.currentTest.results.errors) && !browser.globals.isLocal) {
    const screenshot = await screenShotEntirePage(browser)
    await uploadFile(screenshot, `${getRunPath(browser)}/scenario_failed.png`, browser)
    const url = getFileUrl(`${getRunPath(browser)}/scenario_failed.png`)
    browser.globals.failedImageUrl = url
    log(`☞ last screenshot after failure: ${url}`)
    resolve()
  } else {
    resolve()
  }
})

export const mergeScreenshots = (images: Buffer[], vertical = true): Promise<Buffer> => new Promise(async (resolve, reject) => {
  const fullFileJimp = await mergeImg(images, { direction: vertical })
  fullFileJimp.getBuffer(Jimp.AUTO, (err, buffer) => {
    if (buffer) {
      resolve(buffer)
    } else {
      reject(err)
    }
  })
})

export const screenShotEntirePage = (browser: NightwatchBrowser, viewportHeight?: number, waitBetweenScreenshots?: number): Promise<Buffer> => new Promise<Buffer>(async (resolve, reject) => {
  const height = viewportHeight || get(await getViewportDimensions(browser), 'height')

  try {
    const pageHeight = await new Promise<number>(resolve => browser.execute('return document.documentElement.scrollHeight', [], ({ value }) => resolve(value as number)))
    await new Promise(resolve => browser.execute(`window.scrollTo(0, 0)`, [], resolve))

    const screenShotsCount = Math.ceil(pageHeight / height)

    const screenShots = []
    for (let i = 0; i < screenShotsCount; i++) {
      if (waitBetweenScreenshots) {
        await browser.pause(waitBetweenScreenshots)
      }
      const file = await new Promise(resolve => browser.screenshot(false, ({ value }) => resolve(value)))
      await new Promise(resolve => browser.execute(`window.scrollBy(0, ${height})`, [], resolve))
      screenShots.push(new Buffer(file.toString(), 'base64'))
    }
    const entirePageScreenshot = await mergeScreenshots(screenShots)
    resolve(entirePageScreenshot)
  } catch (e) {
    reject(e)
  }
})

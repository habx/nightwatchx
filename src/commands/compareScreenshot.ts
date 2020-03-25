import EventEmitter from 'events'
import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'
import { get, max, min } from 'lodash'
import fetch from 'node-fetch'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

import { NightwatchAPI } from '../types/nightwatch'
import { compareScreenshotOptions } from '../types/nightwatch.custom'
import { preventIdleTimeout } from '../utils/browserstack'
import { log, logDecorator } from '../utils/console'
import { getFile, getFileUrl, uploadFile } from '../utils/s3'
import {
  getRefPath,
  getRunPath,
  getViewportDimensions,
  mergeScreenshots,
  screenShotEntirePage,
} from '../utils/screenshots'
import { getUrl } from '../utils/url'

class CompareScreenshot extends EventEmitter {
  api: NightwatchAPI
  diffImageBuffer: Buffer

  runsPath: string = getRunPath(this.api)
  refPath: string = getRefPath(this.api)

  compare = async (ref: Buffer, run: Buffer): Promise<number> => {
    const refPng = await new Promise<{
      width: number
      height: number
      data: Buffer
    }>((resolveParsed) => {
      const img = new PNG().parse(ref).on('parsed', () => resolveParsed(img))
    })
    const runPng = await new Promise<{
      width: number
      height: number
      data: Buffer
    }>((resolveParsed) => {
      const img = new PNG().parse(run).on('parsed', () => resolveParsed(img))
    })

    const diffImage = new PNG({ width: refPng.width, height: refPng.height })
    const diff = pixelmatch(
      refPng.data,
      runPng.data,
      diffImage.data,
      refPng.width,
      refPng.height,
      { threshold: 0.1, includeAA: true }
    )
    this.diffImageBuffer = PNG.sync.write(diffImage)
    await uploadFile(
      this.diffImageBuffer,
      `${this.runsPath}/last_diff.png`,
      this.api
    )
    return diff
  }

  command = async (
    fileName: string,
    {
      threshold: paramThreshold,
      waitBetweenScreenshots,
      scrollContainerSelector,
    }: compareScreenshotOptions = {}
  ) => {
    if (this.api.globals.isLocal) {
      this.emit('complete')
      return
    }
    const dimensions = Object.values(await getViewportDimensions(this.api))
    const deviceDimensions = get(
      this.api,
      'options.desiredCapabilities.resolution'
    )
    if (deviceDimensions) {
      const refDimensions = deviceDimensions
        .split('x')
        .map((size) => Number(size.replace('x', '')))
      const percentDimensionDiff =
        Math.abs((max(dimensions) - max(refDimensions)) / max(refDimensions)) +
        Math.abs((min(dimensions) - min(refDimensions)) / min(refDimensions))
      if (percentDimensionDiff > 0.2) {
        log(logDecorator.FgYellow, `Incorrect viewport size`)
        this.emit('complete')
        return
      }
    }
    let optimizedFailedImage: any
    const preventIdleTimeoutInterval = preventIdleTimeout(
      this.api,
      'Comparing screenshots...',
      60000
    )
    const threshold = paramThreshold || this.api.globals.threshold

    const { width, height } = await getViewportDimensions(this.api)

    let run = await screenShotEntirePage(
      this.api,
      height,
      waitBetweenScreenshots,
      scrollContainerSelector
    )

    const refPath = `${this.refPath}/${fileName}.png`
    const ref = await getFile(refPath, this.api)
    if (ref) {
      let diff = await this.compare(ref, run)
      let percentDiff = Math.floor((diff / (width * height)) * 100)

      // retry once just to be sure
      if (percentDiff > threshold * 100) {
        // await this.api.refresh()
        await new Promise((resolve) =>
          this.api.execute(`window.scrollBy(0, 0)`, [], resolve)
        )
        await (() => ({}))()
        run = await screenShotEntirePage(
          this.api,
          height,
          waitBetweenScreenshots,
          scrollContainerSelector
        )
        diff = await this.compare(ref, run)
        percentDiff = Math.floor((diff / (width * height)) * 100)
      }

      const reportCheckpoint = async ({
        filePath,
        status,
      }: {
        filePath: string
        status: 'ok' | 'diff'
      }) => {
        // Report checkpoint
        const result = await fetch(
          `${process.env.EXPORT_ENDPOINT}/runs/${this.api.globals.sessionid}/checkpoints`,
          {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              ...JSON.parse(process.env.EXPORT_HEADERS),
            },
            body: JSON.stringify({
              slug: fileName,
              step: this.api.globals.step,
              status,
              screenshotPath: getFileUrl(filePath, 60 * 60 * 24 * 365),
            }),
          }
        )
        this.api.globals.step++
        return result
      }

      if (percentDiff > threshold * 100) {
        const currentFilePath = `${
          this.runsPath
        }/failed/${new Date().getTime()}.png`
        const failedImage = await mergeScreenshots(
          [ref, this.diffImageBuffer, run],
          false
        )
        optimizedFailedImage = await imagemin.buffer(failedImage, {
          plugins: [
            imageminPngquant({
              strip: true,
              quality: [0.1, 0.3],
            }),
          ],
        })
        await Promise.all([
          uploadFile(run, `${this.refPath}/${fileName}.png`, this.api),
          uploadFile(optimizedFailedImage, currentFilePath, this.api),
          reportCheckpoint({ status: 'diff', filePath: currentFilePath }),
        ])

        const url = getFileUrl(currentFilePath)
        const stringThreshold = `${threshold * 100}%`
        this.api.globals.screenshots[fileName] = {
          percentDiff,
          url,
          name: fileName,
          success: false,
          threshold: stringThreshold,
          failedUrl: await getUrl(this.api),
        }
        log(
          logDecorator.FgYellow,
          '≠',
          logDecorator.Reset,
          `Abnormal screenshot diff of ${percentDiff}%/${stringThreshold}: ${url}`
        )
      } else {
        this.api.globals.screenshots[fileName] = {
          percentDiff,
          success: true,
          name: fileName,
        }
        await reportCheckpoint({ status: 'ok', filePath: refPath })
        log(
          logDecorator.FgGreen,
          '≃',
          logDecorator.Reset,
          `Acceptable diff for ${fileName} (${percentDiff}%)`
        )
      }

      this.emit('complete')
    } else {
      log(logDecorator.FgYellow, `No ref file found`)
      await uploadFile(run, `${this.refPath}/${fileName}.png`, this.api)
      this.emit('complete')
    }
    clearInterval(preventIdleTimeoutInterval)
    return this
  }
}

module.exports = CompareScreenshot

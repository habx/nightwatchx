import fs from 'fs'
import { map, get, reduce } from 'lodash'
import fetch from 'node-fetch'
import stripAnsi from 'strip-ansi'

import { ModuleReport, Report } from '../types/report'

import { ERROR, GOOD, WARNING } from './colors'
import { log } from './console'

const REPORT_PATH = './report.json'

const getCurrentStatusColor = (content: ModuleReport) => {
  if (content.failedCount > 0 || content.errorsCount > 0) {
    return ERROR
  }
  if (content.failedScreenshotCompareCount) {
    return WARNING
  } else return GOOD
}

export const getReportData = (): Promise<Report> =>
  new Promise<Report>(resolve =>
    fs.readFile(REPORT_PATH, (err, data) => {
      if (err) {
        resolve({})
      } else {
        try {
          const jsonData = JSON.parse(data.toString('utf8'))
          resolve(jsonData)
        } catch (e) {
          resolve({})
        }
      }
    })
  )

export const writeReportData = (data: Report): void =>
  fs.writeFileSync(REPORT_PATH, Buffer.from(JSON.stringify(data)))

export const sendReportToSlack = async (silent: boolean) => {
  const report = await getReportData()
  let hasError = false
  const reportForSlack = map(
    report,
    (content: ModuleReport, testKey: string) => {
      const firstScreenshotFailed = content.firstScreenshotFailed
      let fallback = 'Everything went just fine'
      if (content.failedScreenshotCompareCount > 0) {
        fallback = `${testKey} test suite had abnormal screenshot diff`
        hasError = true
      }
      if (content.failedCount > 0 || content.errorsCount > 0) {
        fallback = `${testKey} test suite failed`
        hasError = true
      }

      const titleBlock = {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `*${testKey}*  🚦 ${content.testsCount} assertions  ✅ ${
              content.passedCount
            } passed ❗️${content.failedCount +
              content.errorsCount} failed ⚠️ ${
              content.failedScreenshotCompareCount
            } abnormal ui regressions 🕐 in ${Math.floor(content.totalTime)}s`,
          },
        ],
      }
      const subTitleBlock = {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🚀 ${content.envs.join(', ')} - 🖥  ${content.devices
              .map(
                ({ label, uiRegression, failed }) =>
                  `${
                    content.browserstackLinks[label]
                      ? `<${content.browserstackLinks[label]}|${label}>`
                      : label
                  }${uiRegression ? ' ⚠️' : ''}${failed ? ' ❗️' : ''}`
              )
              .join(', ')}`,
          },
        ],
      }

      const lastScreenBlock = {
        type: 'image',
        title: {
          type: 'plain_text',
          text: 'Last screen',
          emoji: false,
        },
        image_url: content.failedImageUrl,
        alt_text: 'Last screen',
      }

      const failedTestsBlocks = reduce(
        content.failedTests,
        (ctx, c, key) => {
          const message = get(c, 'message')
            ? `\`\`\`${stripAnsi(get(c, 'message', ''))}\`\`\``
            : ''
          return [
            ...ctx,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `<!here|here> ${key} scenario failed ${message}`,
              },
            },
            lastScreenBlock,
          ]
        },
        []
      )

      const uiRegressionBlocks =
        firstScreenshotFailed && !firstScreenshotFailed.success
          ? [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<!here|here> ${
                    firstScreenshotFailed.name
                  } UI regression test exceeded acceptable diff: ${
                    firstScreenshotFailed.percentDiff
                  }% ( >${firstScreenshotFailed.threshold}) ${
                    firstScreenshotFailed.failedUrl
                      ? `<${firstScreenshotFailed.failedUrl}|see failing page>`
                      : ''
                  }`,
                },
              },
              {
                type: 'image',
                title: {
                  type: 'plain_text',
                  text: `${firstScreenshotFailed.name}`,
                  emoji: false,
                },
                image_url: firstScreenshotFailed.url,
                alt_text: firstScreenshotFailed.name,
              },
            ]
          : []

      return {
        fallback,
        color: getCurrentStatusColor(content),
        blocks: [
          titleBlock,
          ...failedTestsBlocks,
          ...uiRegressionBlocks,
          subTitleBlock,
        ],
      }
    },
    []
  )

  // console.log(JSON.stringify(reportForSlack))

  if (!silent) {
    try {
      await fetch(process.env.SLACK_HOOK, {
        method: 'post',
        body: JSON.stringify({ attachments: reportForSlack }),
        headers: { 'Content-Type': 'application/json' },
      })
      if (hasError) {
        await fetch(process.env.SLACK_HOOK_ERROR_ONLY, {
          method: 'post',
          body: JSON.stringify({ attachments: reportForSlack }),
          headers: { 'Content-Type': 'application/json' },
        })
      }
    } catch (e) {
      log(e)
    }
  }
  resetReportData()
}

export const resetReportData = (): void =>
  fs.writeFileSync(REPORT_PATH, Buffer.from(JSON.stringify({})))

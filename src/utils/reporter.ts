import { get, uniq, uniqBy, reduce, mapValues } from 'lodash'

import { NightwatchGlobals } from '../types/nightwatch'

import { getReportData, writeReportData } from './report'

export default async (globals: NightwatchGlobals, results) => {
  const generalReport = await getReportData()
  const currentModules = Object.keys(get(results, 'modules', {}))

  for (let moduleReportName of currentModules) {
    const moduleReport = get(results, ['modules', moduleReportName])
    const failedTests = reduce(
      get(moduleReport, 'completed'),
      (ctx, completedTest, testName) => {
        if (completedTest.errors > 0 || completedTest.failed > 0) {
          return {
            ...ctx,
            [testName]:
              get(completedTest, 'lastError') ||
              get(completedTest, 'stackTrace'),
          }
        }
        return ctx
      },
      {}
    )
    let failedScreenshotCompareCount = 0
    let firstScreenshotFailed = get(generalReport, [
      moduleReportName,
      'firstScreenshotFailed',
    ])
    mapValues(globals.screenshots, screenshotData => {
      if (!screenshotData.success || screenshotData.success === 'false') {
        failedScreenshotCompareCount++
      }
      if (!firstScreenshotFailed && !screenshotData.success) {
        firstScreenshotFailed = screenshotData
      }
    })
    const testsCount = Number(get(moduleReport, 'assertionsCount', 0))
    generalReport[moduleReportName] = {
      sessionid: globals.sessionid,
      raw: results,
      browserstackLinks: {
        ...get(globals.browserstackLinks, moduleReportName, {}),
        ...get(generalReport, [moduleReportName, 'browserstackLinks'], {}),
      },
      lastUrl:
        globals.lastUrl || get(generalReport, [moduleReportName, 'lastUrl']),
      failedImageUrl:
        globals.failedImageUrl ||
        get(generalReport, [moduleReportName, 'failedImageUrl']),
      failedTests: {
        ...get(generalReport, [moduleReportName, 'failedTests'], {}),
        ...failedTests,
      }, // TODO: add errors
      envs: uniq([
        ...get(generalReport, [moduleReportName, 'envs'], []),
        globals.env,
      ]),
      devices: uniqBy(
        [
          ...get(generalReport, [moduleReportName, 'devices'], []),
          {
            label: globals.deviceName,
            uiRegression: failedScreenshotCompareCount > 0,
            failed: Object.values(failedTests).length > 0,
          },
        ],
        'label'
      ),
      totalTime:
        Number(get(generalReport, [moduleReportName, 'totalTime'], 0)) +
        Number(get(moduleReport, 'time', 0)),
      testsCount,
      failedCount:
        Number(get(generalReport, [moduleReportName, 'failedCount'], 0)) +
        Number(get(moduleReport, 'failedCount', 0)),
      errorsCount:
        Number(get(generalReport, [moduleReportName, 'errorsCount'], 0)) +
        Number(get(moduleReport, 'errorsCount', 0)),
      passedCount:
        Number(get(generalReport, [moduleReportName, 'passedCount'], 0)) +
        Number(get(moduleReport, 'passedCount', 0)),
      firstScreenshotFailed,
      failedScreenshotCompareCount:
        failedScreenshotCompareCount +
        Number(
          get(
            generalReport,
            [moduleReportName, 'failedScreenshotCompareCount'],
            0
          )
        ),
    }
  }
  writeReportData(generalReport)
}

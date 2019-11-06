export type ModuleReport = {
  browserstackLinks: object
  failedImageUrl: string
  failedTests: object
  envs: string[]
  devices: {
    label: string
    uiRegression: boolean
    failed: boolean
  }[]
  totalTime: number
  testsCount: number
  failedCount: number
  errorsCount: number
  passedCount: number
  failedScreenshotCompareCount: number
  firstScreenshotFailed: {
    success: boolean
    percentDiff: number
    url: string
    name: string
    threshold: string
    failedUrl: string
  }
}

export type Report = {
  [key: string]: ModuleReport
}

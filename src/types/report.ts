export type ModuleReport = {
  raw: any
  sessionid: string
  browserstackLinks: object
  failedImageUrl: string
  lastUrl: string
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

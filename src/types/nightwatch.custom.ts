import { NightwatchBrowser } from './nightwatch'

export type compareScreenshotOptions = {
  inc?: boolean
  threshold?: number,
  waitBetweenScreenshots?: number,
}

export interface NightwatchxCustomCommands {
  goTo: (url: string, qa?: boolean , callback?: () => void) => NightwatchBrowser,
  compareScreenshot: (fileName: string, options?: compareScreenshotOptions) => NightwatchBrowser,
}

export interface NightwatchCustomAssertions {
  hasProperty: (object: object, path: string | string[]) => NightwatchBrowser
  isEqual: (a: any, b: any) => NightwatchBrowser
}

export type NightwatchxCustomGlobals = {
  threshold?: number,
  screenshots?: {
    [key: string]: {
      success: boolean,
      percentDiff: number,
      url?: string, // image url
      name: string,
      threshold?: string,
      failedUrl?: string,
    },
  },
  url?: string,
  sessionid?: string,
  isLocal?: boolean,
  browserstackLinks?: object,
  failedImageUrl?: string,
  deviceName?: string,
  env?: string,
}

export type BrowserstackDeviceDesktopConfig = {
  env: 'chrome' | 'firefox' | 'ie' | 'safari' | 'edge',
  desiredCapabilities: {
    browser: string,
    resolution: '1024x768' | '1280x800' | '1280x1024' | '1366x768' | '1440x900' | '1680x1050' | '1680x1050' | '1920x1200' | '1920x1080' | '2048x1536',
    browser_version: string,
    os: string,
    os_version: string,
  },
}

export type BrowserstackDeviceMobileConfig = {
  env: 'IOS' | 'Android',
  desiredCapabilities: {
    device: string,
    realMobile: boolean,
    os_version: string,
  },
}

export type BrowserstackDeviceConfig = BrowserstackDeviceDesktopConfig | BrowserstackDeviceMobileConfig

export type BrowserstackDeviceConfigs = {
  [key: string]: BrowserstackDeviceConfig,
}

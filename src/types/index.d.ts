import {
  NightwatchGlobals,
  NightwatchDesiredCapabilities,
  NightwatchOptions,
  NightwatchBrowser,
} from 'nightwatch'

declare module 'nightwatch' {
  export interface NightwatchGlobals {
    deviceName?: string
    sessionid?: string
    isLocal?: string
    browserstackLinks?: {
      [key: string]: any
    }
    env?: string
    threshold: number
    url?: string
    screenshots?: any
    slug?: string
    failedImageUrl?: any
    //[key: string]: any
  }
  export interface NightwatchDesiredCapabilities {
    build: string
    'browserstack.user': string
    'browserstack.key': string
    'browserstack.debug': boolean
    'browserstack.networkLogs': boolean
    browser: string
  }
  export interface NightwatchOptions {
    globals: NightwatchGlobals
  }

  export type compareScreenshotOptions = {
    inc?: boolean
    threshold?: number
    waitBetweenScreenshots?: number
  }

  export interface NightwatchxCustomCommands {
    goTo: (
      url: string,
      qa?: boolean,
      callback?: () => void
    ) => NightwatchBrowser
    compareScreenshot: (
      fileName: string,
      options?: compareScreenshotOptions
    ) => NightwatchBrowser
  }

  export interface NightwatchCustomAssertions {
    hasProperty: (object: object, path: string | string[]) => NightwatchBrowser
    isEqual: (a: any, b: any) => NightwatchBrowser
  }

  export type NightwatchxCustomGlobals = {
    threshold?: number
    screenshots?: {
      [key: string]: {
        success: boolean
        percentDiff: number
        url?: string // image url
        name: string
        threshold?: string
        failedUrl?: string
      }
    }
    slug?: string
    url?: string
    sessionid?: string
    isLocal?: boolean
    browserstackLinks?: object
    failedImageUrl?: string
    deviceName?: string
    env?: string
    language?: string
    [key: string]: any
  }

  export type BrowserstackDeviceDesktopConfig = {
    env: 'chrome' | 'firefox' | 'ie' | 'safari' | 'edge'
    desiredCapabilities: {
      browser: string
      resolution:
        | '1024x768'
        | '1280x800'
        | '1280x1024'
        | '1366x768'
        | '1440x900'
        | '1680x1050'
        | '1680x1050'
        | '1920x1200'
        | '1920x1080'
        | '2048x1536'
      browser_version: string
      os: string
      os_version: string
    }
  }

  type BrowserstackDeviceMobileConfig = {
    env: 'IOS' | 'Android'
    desiredCapabilities: {
      device: string
      realMobile: boolean
      os_version: string
    }
  }

  export type BrowserstackDeviceConfig =
    | BrowserstackDeviceDesktopConfig
    | BrowserstackDeviceMobileConfig

  export type BrowserstackDeviceConfigs = {
    [key: string]: BrowserstackDeviceConfig
  }

  export type NightwatchxEnvironements = {
    [key: string]: {
      url: string
    }
  }
}

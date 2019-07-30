import { BrowserstackDeviceConfigs } from '../src/types/nightwatch.custom'

const devices: BrowserstackDeviceConfigs = {
  default: {
    env: 'chrome',
    desiredCapabilities: {
      browser: 'chrome',
      resolution: '1280x1024',
      browser_version: '74.0',
      os: 'Windows',
      os_version: '10',
    },
  },
  win10_chrome74: {
    env: 'chrome',
    desiredCapabilities: {
      browser: 'chrome',
      resolution: '1280x1024',
      os: 'Windows',
      browser_version: '74.0',
      os_version: '10',
    },
  },
  win10_firefox66: {
    env: 'firefox',
    desiredCapabilities: {
      browser: 'firefox',
      browser_version: '66.0',
      resolution: '1280x1024',
      os: 'Windows',
      os_version: '10',
    },
  },
  win10_edge18: {
    env: 'edge',
    desiredCapabilities: {
      os: 'Windows',
      os_version: '10',
      browser: 'Edge',
      browser_version: '18.0',
      resolution: '1280x1024',
    },
  },
  win10_ie11: {
    env: 'ie',
    desiredCapabilities: {
      browser_version: '11.0',
      browser: 'internet explorer',
      resolution: '1280x1024',
      os: 'Windows',
      os_version: '10',
    },
  },

  android_samsungS9: {
    env: 'Android',
    desiredCapabilities: {
      device: 'Samsung Galaxy S9 Plus',
      realMobile: true,
      os_version: '8.0',
    },
  },
  ios_iphoneX: {
    env: 'IOS',
    desiredCapabilities: {
      device: 'iPhone X',
      realMobile: true,
      os_version: '11',
    },
  },
}

export default devices

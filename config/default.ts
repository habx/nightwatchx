import { NightwatchOptions } from '../src/types/nightwatch'

const defaultConfig: NightwatchOptions = {
  globals_path: '../node_modules/@habx/nightwatchx/dist/config/global.js',
  custom_commands_path: './node_modules/@habx/nightwatchx/dist/src/commands',
  custom_assertions_path:
    './node_modules/@habx/nightwatchx/dist/src/assertions',

  selenium: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80,
  },

  globals: {
    threshold: 0.2,
    url: process.env.DEFAULT_URL,
    screenshots: {},
    browserstackLinks: {},
  },

  test_settings: {
    default: {
      desiredCapabilities: {
        build: 'nightwatch-browserstack',
        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
        'browserstack.debug': true,
        'browserstack.networkLogs': true,
        browser: 'chrome',
      },
    },
  },
}

export default defaultConfig

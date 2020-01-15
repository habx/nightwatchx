import { NightwatchOptions } from 'nightwatch'

const defaultConfig: NightwatchOptions = {
  src_folders: undefined,
  globals_path: '../node_modules/@habx/nightwatchx/dist/config/global.js',
  custom_commands_path: './node_modules/@habx/nightwatchx/dist/src/commands',
  custom_assertions_path:
    './node_modules/@habx/nightwatchx/dist/src/assertions',

  selenium: {
    start_process: false,
    host: 'hub-cloud.browserstack.com',
    port: 80,
    start_session: undefined,
    server_path: undefined,
    log_path: undefined,
    cli_args: undefined,
  },

  globals: {
    threshold: 0.2,
    url: process.env.DEFAULT_URL,
    screenshots: {},
    waitForConditionTimeout: 10000,
    browserstackLinks: {},
  },

  test_settings: {
    default: {
      screenshots: undefined,
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

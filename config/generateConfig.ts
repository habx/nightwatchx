import dotenv from 'dotenv'
import { get, pick, mapValues, omit } from 'lodash'

import defaultConfig from './default'
import devicesConfig from './devices'
import environmentsConfig from './environments'
import { NightwatchOptions } from '../src/types/nightwatch'

dotenv.config()

export const generateConfig = (testSuiteName: string, testConfig: NightwatchOptions, env: string = 'default') => {
  const devices = get(testConfig, 'devices', ['default'])
  console.log('Generate config for', devices.join(', '), 'for', env)

  const config: NightwatchOptions = {
    ...defaultConfig,
    src_folders: [ `dist/tests/${testSuiteName}` ],

    globals: {
      slug: testSuiteName,
      env,
      ...defaultConfig.globals,
      ...testConfig,
      ...environmentsConfig[env],
    },

    test_settings: {
      default: {},
      ...mapValues(pick(devicesConfig, devices), (device, deviceName) => ({
        ...device,
        deviceName,
        desiredCapabilities: {
          build: testSuiteName,
          'browserstack.user': process.env.BROWSERSTACK_USERNAME,
          'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
          'browserstack.debug': true,
          ...device.desiredCapabilities,
        },
      })),
    },
  }
  return `
nightwatch_config = ${JSON.stringify(config)};

module.exports = nightwatch_config;

`
}

export const generateLocalConfig = (testSuiteName: string, testConfig: NightwatchOptions, env: string = 'default') => {
  console.log('Generate local config for', env)

  const config: NightwatchOptions = {
    ...omit(defaultConfig, ['selenium']),
    src_folders: [ `dist/tests/${testSuiteName}` ],

    globals: {
      slug: testSuiteName,
      env,
      ...defaultConfig.globals,
      ...testConfig,
      ...environmentsConfig[env],
      isLocal: true,
    },

    webdriver: {
      server_path: 'node_modules/.bin/chromedriver',
      cli_args: [
        '--verbose',
      ],
      port: 9515,
      start_process: true,
    },

    test_settings : {
      default : {
        desiredCapabilities : {
          browserName : 'chrome',
        },
      },
    },
  }
  return `
nightwatch_config = ${JSON.stringify(config)};

module.exports = nightwatch_config;

`
}

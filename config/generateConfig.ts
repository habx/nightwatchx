import dotenv from 'dotenv'
import { get, pick, mapValues, omit, find } from 'lodash'

import { NightwatchOptions } from '../src/types/nightwatch'

import defaultConfig from './default'
import devicesConfig from './devices'
import environmentsConfig from './environments'

dotenv.config()

export const generateConfig = (
  testSuiteName: string,
  testConfig: NightwatchOptions,
  env: string = 'default'
) => {
  const devices = get(testConfig, 'devices', ['default'])
  // eslint-disable-next-line no-console
  console.log('Generate config for', devices.join(', '), 'for', env)

  const config: NightwatchOptions = {
    ...defaultConfig,
    src_folders: [`dist/tests/${testSuiteName}`],

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
      disable_colors:
        !!find(process.argv, arg => arg.includes('--no-coloration')) ||
        process.env.NO_COLORATION,
    },
  }
  return `
nightwatch_config = ${JSON.stringify(config)};

module.exports = nightwatch_config;

`
}

export const generateLocalConfig = (
  testSuiteName: string,
  testConfig: NightwatchOptions,
  env: string = 'default',
  { headless = false }: { headless: boolean }
) => {
  // eslint-disable-next-line no-console
  console.log('Generate local config for', env)

  const config: NightwatchOptions = {
    ...omit(defaultConfig, ['selenium']),
    src_folders: [`dist/tests/${testSuiteName}`],

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
      cli_args: ['--verbose'],
      port: 9515,
      start_process: true,
    },

    test_settings: {
      default: {
        desiredCapabilities: {
          browserName: 'chrome',
          chromeOptions: {
            args: headless ? ['headless'] : [],
          },
        },
      },
    },
    disable_colors:
      !!find(process.argv, arg => arg.includes('--no-coloration')) ||
      process.env.NO_COLORATION,
  }
  return `
nightwatch_config = ${JSON.stringify(config)};

module.exports = nightwatch_config;

`
}

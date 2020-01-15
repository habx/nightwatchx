import { readFileSync } from 'fs'

import { NightwatchxEnvironements } from '../src/types/nightwatch.custom'

let customEnvs = {}
try {
  customEnvs = JSON.parse(
    readFileSync(`${process.env.INIT_CWD}/config/environments.json`, 'utf8')
  )
} catch (e) {
  console.warn('Please add environments in your config') // eslint-disable-line
}
const envs: NightwatchxEnvironements = customEnvs

export default envs

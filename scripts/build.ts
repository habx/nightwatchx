#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs'
import { generateConfig } from '../config/generateConfig'
import { getDirectories } from './utils'

const testFolders = getDirectories('./dist/tests')
testFolders.forEach(folder => {
  try {
    let manifest
    try {
      manifest = JSON.parse(readFileSync(`./${folder.replace('dist/', '')}/manifest.json`, 'utf8'))
    } catch (e) {
      throw new Error(`Invalid manifest.json for ${folder}`)
    }
    if (typeof manifest.runs !== 'object') throw new Error(`Invalid manifest.json for ${folder}: missing runs object`)
    if (typeof manifest.runs.default !== 'object') throw new Error(`Invalid manifest.json for ${folder}: missing default config in runs`)

    Object.keys(manifest.runs).forEach(run => {
      const currentConfig = { ...manifest.runs.default, ...manifest.runs[run] }
      const envs = currentConfig.environments || ['default']
      envs.forEach(env => {
        const testSuiteName = folder.replace('dist/tests/', '')
        const testSuiteConfig = generateConfig(testSuiteName, currentConfig, env)
        const testSuiteConfigPath = `./dist/${testSuiteName}_${run}_${env}.js`
        writeFileSync(testSuiteConfigPath, testSuiteConfig)
      })
    })
  } catch (e) {
    console.error(e)
  }
})

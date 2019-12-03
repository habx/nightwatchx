#!/usr/bin/env node

import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { get, find } from 'lodash'
import * as shell from 'shelljs'

import { sendReportToSlack } from '../src/utils/report'
import { getJsonFile, uploadFile } from '../src/utils/s3'

import { getDirectories } from './utils'
;(async () => {
  dotenv.config()

  let testOnly = []
  const onlyParam = find(process.argv, arg => arg.includes('--only'))
  const localParam = !!find(process.argv, arg => arg.includes('--local'))
  const silentParam = !!find(process.argv, arg => arg.includes('--silent'))

  if (onlyParam) {
    testOnly = onlyParam.replace('--only=', '').split(',')
  }

  const testFolders = getDirectories('./dist/tests')
  const runsHistory = await getJsonFile('runs.json')

  // run all test suites
  for (const folder of testFolders) {
    try {
      let manifest
      try {
        manifest = JSON.parse(
          readFileSync(`./${folder.replace('dist/', '')}/manifest.json`, 'utf8')
        )
      } catch (e) {
        throw new Error(`Invalid manifest.json for ${folder}`)
      }
      const testSuiteName = folder.replace('dist/tests/', '')

      if (testOnly.length === 0 || testOnly.includes(testSuiteName)) {
        // run tests for all defined runs
        for (const run of Object.keys(manifest.runs)) {
          const lastRunTme = get(runsHistory, [testSuiteName, run], 0)
          const runDiff = new Date().getTime() - lastRunTme
          const runDiffMinutes = Math.floor(runDiff / 60000)
          const frequencyMinutes = (get(manifest, [
            'runs',
            run,
            'frequencyMinutes',
          ]) ||
            get(manifest, ['runs', 'default', 'frequencyMinutes'])) as number
          const shouldRun =
            localParam ||
            (lastRunTme && frequencyMinutes
              ? runDiffMinutes > frequencyMinutes
              : true)

          if (shouldRun) {
            const getTestSuiteConfigPath = (envName: string, isTest = false) =>
              `./dist/${testSuiteName}_${run}_${envName}${
                isTest ? '.local' : ''
              }.js`
            const devicesEnv = get(
              manifest,
              ['runs', run, 'devices'],
              ['default']
            )
            const env = get(
              manifest,
              ['runs', run, 'environments'],
              ['default']
            )

            // run tests for all defined environments + all devices
            for (const envName of env) {
              if (localParam) {
                shell.exec(
                  `./node_modules/.bin/nightwatch -c ${getTestSuiteConfigPath(
                    envName,
                    true
                  )} ${process.argv
                    .filter(arg => arg.includes('--'))
                    .join(' ')}`
                )
              } else {
                for (const deviceEnv of devicesEnv) {
                  shell.exec(
                    `./node_modules/.bin/nightwatch -c ${getTestSuiteConfigPath(
                      envName
                    )} -e ${deviceEnv} ${process.argv
                      .filter(arg => arg.includes('--'))
                      .join(' ')}`
                  )
                  // await runTests(getTestSuiteConfigPath(envName), deviceEnv) // not working for multi env
                }
              }
              await sendReportToSlack(silentParam)
            }

            // save runtime
            if (!runsHistory[testSuiteName]) {
              runsHistory[testSuiteName] = {}
            }
            runsHistory[testSuiteName][run] = new Date().getTime()
          } else {
            // eslint-disable-next-line no-console
            console.log(
              `Skipping run ${run} for test suite ${testSuiteName} (last run was ${runDiffMinutes} minutes ago)`
            )
          }
        }
      } else {
        // eslint-disable-next-line no-console
        console.log(`Skipping ${testSuiteName} test suite`)
      }

      // After all
      await uploadFile(Buffer.from(JSON.stringify(runsHistory)), 'runs.json')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
    }
  }
})()

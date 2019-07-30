#!/usr/bin/env node

if (process.argv.includes('build')) {
  if (process.argv.includes('local')) {
    require('./buildLocal')
  } else {
    require('./build')
  }
} else if (process.argv.includes('test')) {
  require('./runner')
} else {
  console.log(`
    Hey ! Thanks for using Nightwatchx 🦉
    For now you can build your tests by doing "nightwatchx build" or "nightwatchx build local" and then run your integration tests with "nightwatchx test"
    If any trouble using our tool, please add an issue to our repo: https://github.com/habx/nightwatchx
    Cheers
  `)
}

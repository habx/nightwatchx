// import nightwatch from 'nightwatch'
//
// export default (configPath: string, env: string): Promise<any> => new Promise<any>((resolve, reject) => {
//   const runner = nightwatch.CliRunner({ config: configPath, env })
//   runner
//     .setup()
//     .startWebDriver()
//     .catch(err => {
//       console.error(err)
//       throw err
//     })
//     .then(() => {
//       return runner.runTests()
//     })
//     .catch(err => {
//       console.error(err)
//       runner.processListener.setExitCode(10)
//     })
//     .then(() => {
//       return runner.stopWebDriver()
//     })
//     .then(() => {
//       resolve()
//     })
//     .catch(err => {
//       reject(err)
//     })
// })

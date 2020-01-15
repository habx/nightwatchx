import { NightwatchBrowser } from '../types/nightwatch'

export const getLocalStorage = (browser: NightwatchBrowser): Promise<object> =>
  new Promise<object>(resolve =>
    browser.execute(
      'return JSON.stringify(window.localStorage)',
      [],
      ({ value }) => {
        try {
          resolve(JSON.parse(value as string))
        } catch (e) {
          resolve({})
        }
      }
    )
  )

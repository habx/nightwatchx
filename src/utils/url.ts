import {NightwatchBrowser} from 'nightwatch'

export const getUrl = (browser: NightwatchBrowser): Promise<string> =>
  new Promise(resolve => {
    browser.url(({ value }) => resolve(value as string))
  })

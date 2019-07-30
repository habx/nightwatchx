import { classSelector, NightwatchxBrowser } from '@habx/nightwatchx'

module.exports = {
  'Go to home page' : function (browser: NightwatchxBrowser) {
    browser
      .goTo(browser.globals.url)
      .waitForElementVisible('button[title="Accept policy"]')
      .pause(1000)
      .compareScreenshot('home')
  },
  'Region listing' : function (browser: NightwatchxBrowser) {
    const RegionButton = 'div[class*="RegionSearchstyle__IconContainer"]'
    browser
      .goTo(browser.globals.url)
      .waitForElementVisible(RegionButton)
      .click(RegionButton)
      .waitForElementVisible(classSelector('RegionSearchstyle__MenuLineContainer', 'a'))
  },
}

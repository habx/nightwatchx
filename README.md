# QA Browser Automation

QA tool to run scenarii tests and compare screenshots for UI regression using [Nightwatch](http://nightwatchjs.org/) integration with [Browserstack](https://browserstack.com/).

## Usage

``` shell
# run all tests
npm run  test:dev

# run specific tests
npm run  test:dev --only=login

# run on a local chromium
npm run  test:local --only=login
```
### Options
| param   |   description |
|----------|------|
| only     |  run only specified test suites|
| silent   | do not send slack message|
| local   | use the local config that uses a local chromium|

## How tests are ran ?

There are 4 levels of configuration
```bash
├─ test suites/folders
│   ├─ runs <--- defined in `manifest.json` per test
│   │   ├─ environments <--- list of options defined in `environments.ts` (in our case it contains the url [prod/staging/dev]) 
│   │   │   ├─ devices <--- list of options defined in `devices.ts`
 ```
  
## Test suite config

Each test suite is associated to a `manifest.json` file. The later contains the configuration for the tests to be run with browserstack. The whole configuration is passed down to the globals of nightwatch

``` javascript
{
  "runs": {
    "default": {
      "environments": [ // All the environements that should be run for this test
        "prod",
        "dev"
      ]
      "devices": [ // All the devices that should be run for this test
        "win10_edge",
        "mac10.14_chrome70",
        "win10_firefox"
      ],
      "frequencyMinutes": 1440 // The frequency
    },
  },
}
```
### Run options
| option   | type | default | description |
|----------|:------:|------|------|
| environments     | array| \["default"\] | environments to run the test on
| devices     | array| \["default"\] | devices to run the test on
| frequencyMinutes     | number (in minutes)| 0 | frequency of the test
| threshold     | float | 0.2 | 

## Environment config

All the environments options are described in the file `config/environments.ts`. You can also configure specific parameters by environment for tests.
``` typescript
export default {
  default: {
    url: 'http://www.habx.fr',
  },
  dev: {
    url: 'http://www.habx-dev.fr',
  },
  ...
}
```
## Devices config

All the devices settings used by browserstack are described in the file `config/devices.ts`. You can also configure specific parameters by device for tests.
[See how to configure a device for browserstack](https://www.browserstack.com/automate/nightwatch)
``` typescript
export default {
  default: {
    env: 'chrome',
    desiredCapabilities: {
      browser: 'chrome',
      resolution: '1024x768',
      browser_version: '74.0',
      os: 'Windows',
      os_version: '10',
    },
  },
  win10_chrome74: {
    name: 'win10_chrome74',
    env: 'chrome',
    desiredCapabilities: {
      browser: 'chrome',
      resolution: '1024x768',
      os: 'Windows',
      browser_version: '74.0',
      os_version: '10',
    },
  },
  ...
}

```

## Slack integration

A slack message is sent at each run. It contains a summary of the run and its potential errors or warnings

### If everything goes well

<p align="center" style="margin: 0 20%">
  <img height="150" src="https://res.cloudinary.com/habx/image/upload/v1558000512/tech/QA-tool/Capture_d_e%CC%81cran_2019-05-16_a%CC%80_11.53.35.png" />
</p>

### If a screenshot comparison exceeds the acceptable diff

- We show which device(s) failed with a ⚠️
- The first screenshot which exceeded the comparison threshold is attached to the message

<p align="center" style="margin: 0 20%">
  <img width="500" src="https://res.cloudinary.com/habx/image/upload/v1558520747/tech/QA-tool/Capture_d_e%CC%81cran_2019-05-22_a%CC%80_12.24.48.png" />
</p>

### If the test suite fails

- We show which device(s) failed with a ❗️
- A screenshot of the screen just after the test failed is attached to the message

<p align="center" style="margin: 0 20%">
  <img height="200" src="https://res.cloudinary.com/habx/image/upload/v1558520816/tech/QA-tool/Capture_d_e%CC%81cran_2019-05-22_a%CC%80_12.26.38.png" />
</p>

# Nightwatchx 🦉

QA tool to run scenarii tests and compare screenshots for UI regression using [Nightwatch](http://nightwatchjs.org/) integration with [Browserstack](https://browserstack.com/) integrated with [Slack](https://api.slack.com).
![Npm badge](https://img.shields.io/npm/v/@habx/nightwatchx)


## Install
``` shell
# in your project (better if you want to use some of our code for tests)
npm i @habx/nightwatchx

# globaly, you handle tests writing on your own
npm i -g @habx/nightwatchx
```

## Usage

### Build

``` shell
# build tests
npx nightwatchx build

# build local tests
npx nightwatchx build local
```
### Test
```
# run your tests
npx nightwatchx test

# run specific tests
npx nightwatchx test --only=login

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

Each test suite should be associated with a `manifest.json` file. The later contains the configuration for the tests to be run with browserstack. The whole configuration is passed down to the globals of nightwatch

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

All the environments options should be described in the file `config/environments.json`. You could also configure specific parameters by environment for tests.
``` json
{
  "default": {
    "url": "https://www.habx.fr"
  },
  "prod": {
    "url": "https://www.habx.fr"
  },
  "prod_en": {
    "url": "https://www.habx.com/en"
  }
}


```
## Devices config

All the devices settings used by browserstack should be described in the file `config/devices.json`. You could also configure specific parameters by device for tests.
[See how to configure a device for browserstack](https://www.browserstack.com/automate/nightwatch)
``` json
{
  "default": {
    "env": "chrome",
    "desiredCapabilities": {
      "browser": "chrome",
      "resolution": "1024x768",
      "browser_version": "74.0",
      "os": "Windows",
      "os_version": "10"
    }
  }
}

```
### Predefined devices

Some devices are already defined in the library:
- win10_chrome74
- win10_firefox66
- win10_edge18
- win10_ie11
- android_samsungS9
- ios_iphoneX

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

import S3 from 'aws-sdk/clients/s3'

import { NightwatchBrowser } from '../types/nightwatch'

import { preventIdleTimeout } from './browserstack'

const s3 = new S3({
  apiVersion: '2006-03-01',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
})
const BUCKET_NAME =
  process.env.BUCKET_NAME || 'habx-dev-qa-tool-browser-automation'

export const uploadFile = (
  file: Buffer,
  filePath: string,
  browser?: NightwatchBrowser
) =>
  new Promise((resolve, reject) => {
    const interval = preventIdleTimeout(browser, 'Uploading file...')
    s3.putObject(
      {
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: file,
        ContentDisposition: 'inline',
        ContentType: 'image/png',
      },
      (err, data) => {
        if (err) {
          reject(err)
        } else resolve(data)
        clearInterval(interval)
      }
    )
  })

export const getFile = (
  filePath: string,
  browser?: NightwatchBrowser
): Promise<Buffer> =>
  new Promise(resolve => {
    const interval = preventIdleTimeout(browser, 'Downloading file...')
    s3.getObject({ Bucket: BUCKET_NAME, Key: filePath }, (err, data) => {
      if (err) {
        resolve(null)
      } else resolve(new Buffer(data.Body as Buffer))
      clearInterval(interval)
    })
  })

export const getFileUrl = (filePath: string, expires = 60 * 60 * 24): string =>
  s3.getSignedUrl('getObject', {
    Bucket: BUCKET_NAME,
    Key: filePath,
    Expires: expires,
  })

export const getJsonFile = async (filePath: string): Promise<object> => {
  try {
    const jsonFile = await getFile(filePath)
    return JSON.parse(jsonFile.toString('utf8'))
  } catch (e) {
    return {}
  }
}

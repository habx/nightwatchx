import { get } from 'lodash'

exports.assertion = function (object, path) {
  this.message = `Property ${path} exists`

  this.expected = true

  this.pass = function (value) {
    if (!value) {
      this.message = `Property ${path} does not exist`
    } else {
      this.message = `Property ${path} exists ${get(object, path)}`
    }
    return value
  }

  this.value = function () {
    const val = get(object, path)
    return !!val && val !== 'null' && val !== 'undefined'
  }

  this.command = function (callback) {
    callback()
    return this
  }
}

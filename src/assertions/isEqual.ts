exports.assertion = function (a, b) {

  this.message = `Properties are equals`

  this.expected = b

  this.pass = function () {
    const pass = a === b
    if (!pass) {
      this.message = `Properties are not equals`
    }
    return pass
  }

  this.value = function () {
    return a
  }

  this.command = function (callback) {
    callback()
    return this
  }

}

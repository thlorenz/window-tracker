const { EventEmitter } = require('events')
const { exec } = require('child_process')
const path = require('path')
const cmd = path.join(__dirname, 'window-tracker')

function filterFromRegExp(r) {
  if (r == null) return function notest(x) { return true }
  return function testRx(x) { return r.test(x) }
}

class WindowTracker extends EventEmitter {
  constructor({ interval = 10000, appFilter, windowFilter }) {
    super()
    if (appFilter != null && !(appFilter instanceof RegExp)) {
      throw new Error('appFilter needs to be a RegExp')
    }
    if (windowFilter != null && !(windowFilter instanceof RegExp)) {
      throw new Error('windowFilter needs to be a RegExp')
    }

    if (interval != null && typeof interval !== 'number') {
      throw new Error('interval needs to be a number')
    }

    this._interval = interval
    this._appFilter = filterFromRegExp(appFilter)
    this._windowFilter = filterFromRegExp(windowFilter)
  }

  start() {
    this._intervalClear = setInterval(() => this.query(), this._interval)
    return this
  }

  stop() {
    clearInterval(this._intervalClear)
    return this
  }

  query(cb = null) {
    exec(cmd, (err, res) => this._onresult(err, res, cb))
    return this
  }

  _onresult(err, res, cb) {
    if (err) {
      if (cb !== null) cb(err)
      return this.emit('error', err)
    }
    const infos = res
      .split('\n')
      .filter(line => line && line.trim().length)
      .map(line => JSON.parse(line))

    const relevantInfos = infos
      .filter(x => this._appFilter(x.app) && this._windowFilter(x.window))

    if (relevantInfos.length) this.emit('info', relevantInfos)

    if (cb !== null) cb(null, relevantInfos)
  }
}

module.exports = function windowTracker({ interval, appFilter, windowFilter } = {}) {
  return new WindowTracker({ interval, appFilter, windowFilter })
}

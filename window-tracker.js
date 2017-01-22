const { EventEmitter } = require('events')
const { exec } = require('child_process')
const path = require('path')
const cmd = path.join(__dirname, 'window-tracker')

function filterFromRegExpOrFunction(r) {
  if (r == null) return function notest(x) { return true }
  if (typeof r === 'function') return r
  return function testRx(x) { return r.test(x) }
}

class WindowTracker extends EventEmitter {
  constructor({ interval = 10000, appFilter, windowFilter }) {
    super()
    if (appFilter != null &&
      !(appFilter instanceof RegExp || typeof appFilter !== 'function')) {
      throw new Error('appFilter needs to be a RegExp or a function')
    }
    if (windowFilter != null &&
      !(windowFilter instanceof RegExp || typeof appFilter !== 'function')) {
      throw new Error('windowFilter needs to be a RegExp or a function')
    }

    if (interval != null && typeof interval !== 'number') {
      throw new Error('interval needs to be a number')
    }

    this._interval = interval
    this._appFilter = filterFromRegExpOrFunction(appFilter)
    this._windowFilter = filterFromRegExpOrFunction(windowFilter)
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

  _safeParse(line) {
    try {
      return JSON.parse(line)
    } catch (err) {
      this.emit('error', err)
      return null
    }
  }

  _onresult(err, res, cb) {
    if (err) {
      if (cb !== null) cb(err)
      return this.emit('error', err)
    }
    const infos = res
      .split('\n')
      .filter(line => line && line.trim().length)
      .map(line => this._safeParse(line))
      .filter(x => x != null)

    const relevantInfos = infos
      .filter(x => this._appFilter(x.app) && this._windowFilter(x.window))

    if (relevantInfos.length) this.emit('info', relevantInfos)

    if (cb !== null) cb(null, relevantInfos)
  }
}

module.exports = function windowTracker({ interval, appFilter, windowFilter } = {}) {
  return new WindowTracker({ interval, appFilter, windowFilter })
}

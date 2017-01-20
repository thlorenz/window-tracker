// launch `mvim window-tracker` to see some results

const { inspect } = require('util')
const getWindowTracker = require('../')

const appFilter = /MacVim/i
const windowFilter = /window-tracker/i

const windowTracker = getWindowTracker({ interval: 500, appFilter, windowFilter })
  .on('error', console.error)
  .on('info', oninfo)
  .start()

let count = 0
function oninfo(info) {
  console.log(inspect(info, false, 5, true))
  if (++count > 20) windowTracker.stop()
}

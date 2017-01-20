// not using any filters here, so we'll see all windows output

const windowTracker = require('../')()
windowTracker.query(onresult)

function onresult(err, infos) {
  if (err) return console.error(err)
  console.log(infos)
}

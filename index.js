const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { OUTPUT_DIR } = require('./src/config')

const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)

const start = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // Get gif urls
  // TODO: Check length of mp4?
  // TODO: Add Reddit integration
  const urls = [
    'https://i.imgur.com/ZzvLeYr.mp4',
    'https://i.imgur.com/5HBrg7a.mp4',
    'https://i.imgur.com/T3ontQy.mp4',
    'https://i.imgur.com/EeZQF45.gifv',
    'https://gfycat.com/thirstyrectangulareel'
  ]

  // Download files
  urls.forEach(url => {
    fork('./src/bot.js', [ OUTPUT_PATH, url ])
  })
}

start()

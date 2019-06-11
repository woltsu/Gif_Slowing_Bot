// Imports
const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork

// Constants
const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), './output')

const start = async () => {
  // Init
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // Get gif urls
  // TODO: Gyfcat as well: https://developers.gfycat.com/api/#getting-gfycats
  // TODO: What if no mp4 available?
  // TODO: Check length of mp4?
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

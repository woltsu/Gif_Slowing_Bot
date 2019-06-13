const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { OUTPUT_DIR } = require('./src/config')
const { getUrls } = require('./src/reddit')

const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)

const start = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // TODO: Add max length to gifs / timeout to download
  // TODO: Error handling
  // TODO: Add possibility to only slow down a specific part of a gif
  // TODO: Add Reddit integration
  // TODO: Upload results to imgur
  // TODO: Test how well raspberry performs
  // TODO: Database?
  const urlItems = await getUrls()

  urlItems.forEach(item => {
    fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item)])
  })
}

start()

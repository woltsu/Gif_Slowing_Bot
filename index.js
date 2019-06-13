const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { OUTPUT_DIR, ERRORS } = require('./src/config')
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
  try {
    const urlItems = await getUrls()
    urlItems.forEach(item => {
      fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item)])
    })
  } catch (e) {
    switch (e.message) {
      case ERRORS.ERROR_AUTHENTICATING_TO_REDDIT: {
        console.error('Error authenticating to reddit!')
        break
      }

      case ERRORS.ERROR_FETCHING_REDDIT_URL_DATA: {
        console.error('Error fetching reddit url data')
        break
      }

      case ERRORS.ERROR_FETCHING_REDDIT_MENTIONS: {
        console.error('Error fetching reddit mentions')
        break
      }

      case ERRORS.ERROR_MARKING_REDDIT_MESSAGE_READ: {
        console.error('Error marking reddit messages read')
        break
      }

      default: {
        console.error('Unknown error!')
        break
      }
    }
    process.exit(1)
  }
}

start()

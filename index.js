const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { ERRORS, OUTPUT_DIR } = require('./src/config')
const Reddit = require('./src/reddit')
const logger = require('./src/logger')
const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)

// TODO: Add possibility to only slow down a specific part of a gif
// TODO: Add possibility to slow down urls in comments
// TODO: Test how well raspberry performs
// TODO: Database?
const start = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  const reddit = new Reddit({
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    clientId: process.env.REDDIT_CLIENT_ID,
    secret: process.env.REDDIT_SECRET
  })

  logger.info('Fetching urls...')
  let urlItems
  try {
    urlItems = await reddit.getUrls()
  } catch (e) {
    process.exit(1)
  }

  urlItems.forEach((item, i) => {
    const child = fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item)])
    logger.info(`BOT ${ i + 1 } IN PROGRESS`)

    child.on('message', async ({ imgurUrl, error }) => {
      if (imgurUrl) {
        try {
          const id = `${item.kind}_${item.commentId}`
          const message = `${ imgurUrl }\n\n---\n\n^(I am a bot.)`
          await reddit.replyToComment(message, id)
          //await reddit.markMessageRead(id)
          logger.info(`BOT ${ i + 1 } COMPLETED`)
        } catch (e) {
          logger.error('Failed replying to reddit comment. Will try again later.')
          logger.info(`BOT ${ i + 1 } FAILED`)
        }
      } else if (error) {
        logger.info(`BOT ${ i + 1 } FAILED`)
        if ([ ERRORS.ERROR_UNSUPPORTED_FORMAT, ERRORS.ERROR_UNSUPPORTED_DOMAIN ].includes(error.message)) {
          //await reddit.markMessageRead(id)
        }
      }
    })
  })
}

start()

const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { CronJob } = require('cron')
const { ERRORS, OUTPUT_DIR } = require('./src/config')
const Reddit = require('./src/reddit')
const logger = require('./src/logger')()
const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)

let RUNNING = false

const schedule = (cronTime, func) => new CronJob({ cronTime, onTick: func, start: true, timeZone: 'Europe/Helsinki' })

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
    logger.error(e)
    RUNNING = false
    return
  }

  if (urlItems.length === 0) {
    logger.info('No mentions!')
    RUNNING = false
    return
  }

  let finishedAmount = 0
  urlItems.forEach((item, i) => {
    const child = fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item), i + 1])
    logger.info(`BOT ${ i + 1 } IN PROGRESS`, item)

    child.on('message', async ({ gfycatUrl, error }) => {
      const id = `${item.kind}_${item.commentId}`
      if (gfycatUrl) {
        try {
          const message = `${ gfycatUrl }\n\n---\n\n^(I am a bot.) [^(GitHub)](https://github.com/woltsu/Gif_Slowing_Bot) ^(|) [^(FAQ)](https://www.reddit.com/user/Gif_Slowing_Bot/comments/c26pca/ugif_slowing_bot/) ^(|) [^(Report an issue)](https://www.reddit.com/message/compose/?to=appl3xx&subject=Gif_Slowing_Bot%20Issue)`
          await reddit.replyToComment(message, id)
          await reddit.markMessageRead(id)
          logger.info(`BOT ${ i + 1 } COMPLETED`)
        } catch (e) {
          logger.error('Failed replying to reddit comment. Will try again later.', item)
          logger.info(`BOT ${ i + 1 } FAILED`)
        }
      } else if (error) {
        logger.info(`BOT ${ i + 1 } FAILED`, item)
        if ([ ERRORS.ERROR_UNSUPPORTED_FORMAT, ERRORS.ERROR_UNSUPPORTED_DOMAIN ].includes(error.message)) {
          try {
            await reddit.markMessageRead(id)
          } catch (e) {
            console.log(e, item)
          }
        }
      }
      if (++finishedAmount === urlItems.length) RUNNING = false
    })
  })
}

schedule('*/20 * * * * *', async () => {
  if (!RUNNING) {
    RUNNING = true
    try {
      await start()
    } catch (e) {
      RUNNING = false
      console.log(e)
    }
  }
})

const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { OUTPUT_DIR } = require('./src/config')
const { logError } = require('./src/utils')
const Reddit = require('./src/reddit')
const chalk = require('chalk').default
const readline = require('readline')
const AsyncLock = require('async-lock')

const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)
const lock = new AsyncLock()

const start = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // TODO: Add possibility to only slow down a specific part of a gif
  // TODO: Add possibility to slow down urls in comments
  // TODO: Test how well raspberry performs
  // TODO: Database?
  const reddit = new Reddit({
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    clientId: process.env.REDDIT_CLIENT_ID,
    secret: process.env.REDDIT_SECRET
  })

  process.stdout.write('Fetching urls... ' + chalk.yellowBright('IN PROGRESS') + '\n')
  let urlItems
  try {
    urlItems = await reddit.getUrls()
  } catch (e) {
    process.exit(1)
  }
  readline.moveCursor(process.stdout, 0, -1)
  readline.clearLine(process.stdout, 0)
  process.stdout.write('Fetching urls... ' + chalk.greenBright('DONE') + '\n')

  urlItems.forEach((item, i) => {
    const child = fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item)])

    process.stdout.write('BOT ' + (i + 1) + ' ' + chalk.yellowBright('IN PROGRESS') + '\n')

    child.on('message', async ({ imgurUrl, error }) => {
      if (imgurUrl) {
        try {
          const id = `${item.kind}_${item.commentId}`
          const message = `${ imgurUrl }\n\n---\n\n^(I am a bot.)`
          await reddit.replyToComment(message, id)
          //await reddit.markMessageRead(id)
          updateBotStatus(chalk.greenBright('DONE'), i, urlItems.length)
        } catch (e) {
          updateBotStatus(chalk.redBright('FAIL'), i, urlItems.length)
          logError('Failed replying to reddit comment. Will try again later.')
        }
      } else if (error) {
        updateBotStatus(chalk.redBright('FAIL'), i, urlItems.length)
      }
    })
  })
}

const updateBotStatus = (message, index, total) => {
  lock.acquire(1, done => {
    readline.moveCursor(process.stdout, 0, -1 * (total - index))
    readline.clearLine(process.stdout, 0)
    process.stdout.write('BOT ' + (index + 1) + ' ' + message + '\n')
    readline.moveCursor(process.stdout, 0, (total - index + 1))
    done()
  })
}

start()

const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork
const { OUTPUT_DIR } = require('./src/config')
const Reddit = require('./src/reddit')

const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), OUTPUT_DIR)

const start = async () => {
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // TODO: Add possibility to only slow down a specific part of a gif
  // TODO: Test how well raspberry performs
  // TODO: Database?
  const reddit = new Reddit({
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD,
    clientId: process.env.REDDIT_CLIENT_ID,
    secret: process.env.REDDIT_SECRET
  })
  const urlItems = await reddit.getUrls()

  urlItems.forEach(item => {
    const child = fork('./src/bot.js', [ OUTPUT_PATH, JSON.stringify(item)])
    child.on('message', async ({ imgurUrl }) => {
      if (imgurUrl) {
        try {
          await reddit.replyToComment(imgurUrl, `${item.kind}_${item.commentId}`)
          //await reddit.markMessageRead(item.kind, item.commentId)
        } catch (e) {
          console.log(e)
        }
      }
    })
  })
}

start()

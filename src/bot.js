const fs = require('fs')
const { download, uploadToImgur } = require('./gifHandler')
const { slowMo } = require('./ffmpeg')
const { promisify } = require('util')
const { DEFAULT_FORMAT } = require('./config')
const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)
const path = require('path')
const { log } = require('./utils')

class Bot {
  constructor({ urlItem, output }) {
    this.urlItem = urlItem
    this.output = output
  }

  async run() {
    try {
      log(`Downloading ${ this.urlItem.url }...`)
      this.fileName = await download(this.urlItem, this.output)

      log(`Applying slow mo to ${ this.fileName }...`)
      await slowMo(this.fileName, this.output)

      log('Uploading to imgur...')
      const slowedFilePath = path.resolve(this.output, `${this.fileName}.slowed.${DEFAULT_FORMAT}`)
      const imgurUrl = await uploadToImgur(slowedFilePath, this.fileName)
      log(`Uploaded ${ this.fileName } to imgur: ${ imgurUrl }`)
      process.send({ imgurUrl })
      this._teardown()
    } catch (e) {
      this._teardown()
      process.send({ error: true })
    }
  }

  async _teardown() {
    log('Tearing bot down...')
    if (this.fileName) {
      const files = await readdir(this.output)
      const unlinks = files.filter(f => f.includes(this.fileName)).map(f => unlink(`${this.output}/${f}`))
      await Promise.all(unlinks)
    }
  }
}

const OUTPUT_PATH = process.argv[2]
const urlItem = JSON.parse(process.argv[3])

const bot = new Bot({
  urlItem,
  output: OUTPUT_PATH
})

bot.run()

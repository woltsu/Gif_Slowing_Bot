const fs = require('fs')
const { download, uploadToImgur } = require('./gifHandler')
const { slowMo } = require('./ffmpeg')
const { promisify } = require('util')
const { DEFAULT_FORMAT } = require('./config')
const readdir = promisify(fs.readdir)
const unlink = promisify(fs.unlink)
const path = require('path')

const OUTPUT_PATH = process.argv[2]
const urlItem = JSON.parse(process.argv[3])

const runBot = async () => {
  console.log(`Downloading ${ urlItem.url }...`)
  const fileName = await download(urlItem, OUTPUT_PATH)

  console.log(`Applying slow mo to ${ fileName }...`)
  await slowMo(fileName, OUTPUT_PATH)

  console.log('Uploading to imgur...')
  const slowedFilePath = path.resolve(OUTPUT_PATH, `${fileName}.slowed.${DEFAULT_FORMAT}`)
  const imgurUrl = await uploadToImgur(slowedFilePath, fileName)
  console.log(`Uploaded ${ fileName } to imgur: ${ imgurUrl }`)
  process.send({ imgurUrl })

  console.log('Removing created files...')
  const files = await readdir(OUTPUT_PATH)
  const unlinks = files.filter(f => f.includes(fileName)).map(f => unlink(`${OUTPUT_PATH}/${f}`))
  await Promise.all(unlinks)
  console.log(`${ fileName } done!`)
}

runBot()

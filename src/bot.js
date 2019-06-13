const { download } = require('./gifHandler')
const { slowMo } = require('./ffmpeg')

const OUTPUT_PATH = process.argv[2]
const urlItem = JSON.parse(process.argv[3])

const runBot = async () => {
  console.log(`Downloading ${ urlItem.url }...`)
  const fileName = await download(urlItem, OUTPUT_PATH)

  console.log(`Applying slow mo to ${ fileName }...`)
  await slowMo(fileName, OUTPUT_PATH)

  // TODO: Reddit reply
  console.log(`${ fileName } done!`)
}

runBot()

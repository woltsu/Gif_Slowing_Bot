const { download } = require('./gifHandler')
const { slowMo } = require('./ffmpeg')

const OUTPUT_PATH = process.argv[2]
const URL = process.argv[3]

const runBot = async () => {
  const fileName = await download(URL, OUTPUT_PATH)
  //await slowMo(fileName, OUTPUT_PATH)
  process.exit(true)
}

runBot()

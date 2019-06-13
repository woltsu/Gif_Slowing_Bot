const { download } = require('./gifHandler')
const { slowMo } = require('./ffmpeg')
const { ERRORS } = require('./config')

const OUTPUT_PATH = process.argv[2]
const urlItem = JSON.parse(process.argv[3])

const runBot = async () => {
  try {
    console.log(`Downloading ${ urlItem.url }...`)
    const fileName = await download(urlItem, OUTPUT_PATH)

    console.log(`Applying slow mo to ${ fileName }...`)
    await slowMo(fileName, OUTPUT_PATH)

    // TODO: Reddit reply
    console.log(`${ fileName } done!`)
  } catch (e) {
    switch (e.message) {
      case ERRORS.ERROR_FETCHING_GIF_INFO: {
        console.error('Error fetching imgur info!')
        break
      }

      case ERRORS.ERROR_DOWNLOADING_GIF: {
        console.error('Error downloading gif!')
        break
      }

      case ERRORS.ERROR_UNSUPPORTED_DOMAIN: {
        console.error('Error unsupported domain!')
        break
      }

      default: {
        console.error('Unknown error!')
        break
      }
    }
  }
  process.exit(1)
}

runBot()

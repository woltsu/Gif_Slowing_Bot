const { download } = require('./src/imgur')
const { slowMo } = require('./src/ffmpeg')

const start = async () => {
  const fileName = await download('https://i.imgur.com/ZzvLeYr.mp4')
  await slowMo(fileName)
}

start()

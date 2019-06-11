// Imports
const fs = require('fs')
const path = require('path')
const axios = require('axios').default

// Constants
const chars = 'abcdefghijklmnopqrstuvwxyz1234567890'

process.on('message', async ({ url }) => {
  if (url) {
    const OUTPUT_PATH = process.argv[2]
    const resultName = await download(url, OUTPUT_PATH)
    process.send({ resultName })
    process.exit(0)
  } else {
    process.exit(1)
  }
})

const download = async (url, dir) => {
  const resultName = generateName()
  const resultPath = path.resolve(dir, `${resultName}.mp4`)
  const writer = fs.createWriteStream(resultPath)

  const fileStream = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })
  fileStream.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(resultName))
    writer.on('error', reject)
  })
}

const generateName = () => {
  let result = ''
  for (let i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

module.exports = {
  download
}
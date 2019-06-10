// Imports
const fs = require('fs')
const path = require('path')
const axios = require('axios').default

// Constants
const RESULT_DIR = 'output'

const download = async (url) => {
  const resultName = 'result.mp4'
  const resultPath = path.resolve(path.dirname(require.main.filename), RESULT_DIR, resultName)
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

module.exports = {
  download
}
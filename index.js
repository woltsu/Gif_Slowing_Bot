// Imports
const fs = require('fs')
const path = require('path')
const fork = require('child_process').fork

// Constants
const OUTPUT_PATH = path.resolve(path.dirname(require.main.filename), './output')

const start = async () => {
  // Init
  if (!fs.existsSync(OUTPUT_PATH)) {
    fs.mkdirSync(OUTPUT_PATH)
  }

  // Get imgur urls
  // TODO: Gyfcat as well: https://developers.gfycat.com/api/#getting-gfycats
  // TODO: What if no mp4 available?
  // TODO: Check length of mp4?
  const urls = [
    'https://i.imgur.com/ZzvLeYr.mp4',
    'https://i.imgur.com/5HBrg7a.mp4',
    'https://i.imgur.com/T3ontQy.mp4',
    'https://i.imgur.com/KpOrSbE.mp4'
  ]

  // Download files
  urls.forEach(url => {
    const downloadProcess = fork('./src/imgur.js', [ OUTPUT_PATH ])
    downloadProcess.on('message', ({ resultName }) => {
      if (resultName) {
        console.log(`Downloaded: ${ resultName }`)
        const slowMoProcess = fork('./src/ffmpeg.js', [ OUTPUT_PATH ])
        slowMoProcess.send({ fileName: resultName })
      }
    })
    downloadProcess.send({ url })
  })
}

start()

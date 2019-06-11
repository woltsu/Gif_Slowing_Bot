const spawn = require('child_process').spawn
const path = require('path')
const { LOGGING } = require('./config')

const slowMo = async (fileName, dir) => {
  const file = path.resolve(dir, `${fileName}.mp4`)
  const result = path.resolve(dir, `${fileName}-slowed.mp4`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-i', file, '-vf', 'setpts=2*PTS', result ]
  )

  ffmpeg.on('exit', () => {
    console.log(`${ fileName } conversion finished`)
    process.exit(0)
  })

  return new Promise((resolve) => {
    if (LOGGING) {
      ffmpeg.stderr.on('data', (data) => console.log(new String(data)))
    }
    ffmpeg.on('exit', () => resolve(true))
  })
}

module.exports = {
  slowMo
}
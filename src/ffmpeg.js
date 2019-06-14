const spawn = require('child_process').spawn
const path = require('path')
const { LOGGING, DEFAULT_FORMAT } = require('./config')

const slowMo = (fileName, dir) => {
  const file = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)
  const result = path.resolve(dir, `${fileName}.slowed.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-i', file, '-vf', 'setpts=2*PTS', '-t', '00:00:30', result ]
  )

  return processCommand(ffmpeg)
}

const convertGifToMp4 = (fileName, dir) => {
  const file = path.resolve(dir, `${fileName}.gif`)
  const result = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-i', file, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', result ]
  )

  return processCommand(ffmpeg)
}

const processCommand = (command) => {
  return new Promise(resolve => {
    if (LOGGING) {
      command.stderr.on('data', (data) => console.log(new String(data)))
    }
    command.on('exit', () => resolve(true))
  })
}

module.exports = {
  slowMo,
  convertGifToMp4
}
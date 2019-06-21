const spawn = require('child_process').spawn
const path = require('path')
const { LOGGING, DEFAULT_FORMAT } = require('./config')
const logger = require('./logger')('ffmpeg')

const slowMo = (fileName, dir) => {
  const file = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)
  const result = path.resolve(dir, `${fileName}.slowed.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-loglevel', 'panic', '-hide_banner', '-nostats', '-i', file, '-vf', 'setpts=3*PTS', '-t', '00:00:30', result ]
  )

  return processCommand(ffmpeg)
}

const convertGifToMp4 = (fileName, dir) => {
  const file = path.resolve(dir, `${fileName}.gif`)
  const result = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-loglevel', 'panic', '-hide_banner', '-nostats', '-i', file, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', result ]
  )

  return processCommand(ffmpeg)
}

const processCommand = (command) => {
  return new Promise(resolve => {
    if (LOGGING) {
      command.stderr.on('data', (data) => logger.info(new String(data)))
    }
    command.on('exit', () => resolve(true))
  })
}

module.exports = {
  slowMo,
  convertGifToMp4
}
const spawn = require('child_process').spawn
const path = require('path')
const { LOGGING, DEFAULT_FORMAT } = require('./config')
const logger = require('./logger')('ffmpeg')

const slowMo = (fileName, dir, options) => {
  const startTime = options.startTime || '00:00:00'
  const input = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)
  const output = path.resolve(dir, `${fileName}.slowed.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-loglevel', 'error', '-hide_banner', '-nostats', '-ss', startTime, '-i', input, '-vf', 'setpts=2*PTS', '-t', '00:01:00', '-fs', '140M', output ]
  )

  return processCommand(ffmpeg)
}

const convertGifToMp4 = (fileName, dir) => {
  const input = path.resolve(dir, `${fileName}.gif`)
  const output = path.resolve(dir, `${fileName}.${DEFAULT_FORMAT}`)

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-loglevel', 'error', '-hide_banner', '-nostats', '-i', input, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', output ]
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
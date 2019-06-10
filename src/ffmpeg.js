const spawn = require('child_process').spawn
const path = require('path')

// Constants
const RESULT_DIR = 'output'

const slowMo = async (fileName) => {
  const file = path.resolve(path.dirname(require.main.filename), RESULT_DIR, fileName)
  const result = path.resolve(path.dirname(require.main.filename), RESULT_DIR, 'slowed.mp4')

  const ffmpeg = spawn(
    'ffmpeg',
    [ '-y', '-i', file, '-vf', 'setpts=2*PTS', result ]
  )

  ffmpeg.on('exit', () => console.log('conversion finished'))
}

module.exports = {
  slowMo
}
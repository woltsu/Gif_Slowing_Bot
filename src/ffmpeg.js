const spawn = require('child_process').spawn
const path = require('path')

process.on('message', ({ fileName }) => {
  if (fileName) {
    const OUTPUT_PATH = process.argv[2]
    console.log(`converting ${ fileName } to slowmo...`)
    slowMo(fileName, OUTPUT_PATH)
  } else {
    process.exit(1)
  }
})

const slowMo = (fileName, dir) => {
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

  //ffmpeg.stderr.on('data', (data) => console.log(new String(data)))
}

module.exports = {
  slowMo
}
const dotenv = require('dotenv')

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'development') {
  dotenv.config()
}

module.exports.VERSION = '0.1'
module.exports.LOGGING = false
module.exports.CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890'
module.exports.OUTPUT_DIR = './output'
module.exports.DOMAINS = {
  imgur: 'i.imgur.com',
  gfycat: 'gfycat.com',
  reddit: 'preview.redd.it'
}
module.exports.SUPPORTED_DOMAINS = Object.values(module.exports.DOMAINS)
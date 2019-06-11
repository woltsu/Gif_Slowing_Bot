const dotenv = require('dotenv')

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'development') {
  dotenv.config()
}

module.exports.LOGGING = false
module.exports.CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890'
module.exports.OUTPUT_DIR = './output'
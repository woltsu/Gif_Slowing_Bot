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

module.exports.ERRORS = {
  ERROR_FETCHING_GIF_INFO: 'Error fetching gif info',
  ERROR_UNSUPPORTED_DOMAIN: 'Error unsupported domain',
  ERROR_DOWNLOADING_GIF: 'Error downloading gif',
  ERROR_AUTHENTICATING_TO_REDDIT: 'Error authenticating to reddit',
  ERROR_FETCHING_REDDIT_MENTIONS: 'Error fetching reddit mentions',
  ERROR_FETCHING_REDDIT_URL_DATA: 'Error fetching reddit url data',
  ERROR_MARKING_REDDIT_MESSAGE_READ: 'Error marking reddit messages read'
}
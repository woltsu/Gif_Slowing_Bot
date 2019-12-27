const dotenv = require('dotenv')

const NODE_ENV = process.env.NODE_ENV

if (NODE_ENV === 'development') {
  dotenv.config()
}

module.exports.NODE_ENVS = {
  production: 'production',
  development: 'development'
}
module.exports.VERSION = '1.0'
module.exports.LOGGING = true
module.exports.CHARS = 'abcdefghijklmnopqrstuvwxyz1234567890'
module.exports.OUTPUT_DIR = './output'
module.exports.DEFAULT_FORMAT = 'mp4'
module.exports.DOMAINS = {
  i_imgur: 'i.imgur.com',
  imgur: 'imgur.com',
  gfycat: 'gfycat.com',
  reddit_preview: 'preview.redd.it',
  reddit_i: 'i.redd.it'
}

module.exports.MESSAGE_SUBJECTS = {
  usernameMention: 'username mention',
  commentReply: 'comment reply'
}

module.exports.ERRORS = {
  ERROR_FETCHING_GIF_INFO: 'Error fetching gif info',
  ERROR_UNSUPPORTED_DOMAIN: 'Error unsupported domain',
  ERROR_DOWNLOADING_GIF: 'Error downloading gif',
  ERROR_AUTHENTICATING_TO_REDDIT: 'Error authenticating to reddit',
  ERROR_FETCHING_REDDIT_MENTIONS: 'Error fetching reddit mentions',
  ERROR_FETCHING_REDDIT_URL_DATA: 'Error fetching reddit url data',
  ERROR_MARKING_REDDIT_MESSAGE_READ: 'Error marking reddit messages read',
  ERROR_REPLYING_TO_REDDIT_COMMENT: 'Error replying to reddit comment',
  ERROR_UNSUPPORTED_FORMAT: 'Error unsupported format',
  ERROR_UPLOADING_TO_IMGUR: 'Error uploading to imgur'
}
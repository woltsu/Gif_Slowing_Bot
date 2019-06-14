module.exports.handleError = (e, message) => {
  console.error(e)

  switch (message) {
    case ERRORS.ERROR_FETCHING_GIF_INFO: {
      console.error('Error fetching imgur info!')
      break
    }

    case ERRORS.ERROR_DOWNLOADING_GIF: {
      console.error('Error downloading gif!')
      break
    }

    case ERRORS.ERROR_UNSUPPORTED_DOMAIN: {
      console.error('Error unsupported domain!')
      break
    }

    case ERRORS.ERROR_MARKING_REDDIT_MESSAGE_READ: {
      console.error('Error marking reddit message read!')
      break
    }

    case ERRORS.ERROR_AUTHENTICATING_TO_REDDIT: {
      console.error('Error authenticating to reddit!')
      break
    }

    case ERRORS.ERROR_FETCHING_REDDIT_URL_DATA: {
      console.error('Error fetching reddit url data')
      break
    }

    case ERRORS.ERROR_FETCHING_REDDIT_MENTIONS: {
      console.error('Error fetching reddit mentions')
      break
    }

    default: {
      console.error('Unknown error!')
      break
    }
  }

  process.exit(1)
}
const _ = require('lodash')
const { ERRORS } = require('./config')
const logger = require('./logger')('error')

module.exports.handleError = (e, errorMessage) => {
  logger.error(e.name)
  logger.error(e.message)
  logger.error(e.stack)
  if (e.response) {
    logger.error(JSON.stringify(e))
  }
  let errorName = _.findKey(ERRORS, val => val === errorMessage)
  if (!errorName) errorName = 'UNKNOWN_ERROR'
  const error = new Error(errorMessage)
  error.name = errorName
  error.stack = e.stack
  if (errorMessage) logger.error(errorMessage)
  throw error
}
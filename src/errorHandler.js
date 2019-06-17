const chalk = require('chalk').default
const _ = require('lodash')
const { ERRORS } = require('./config')
const { logError } = require('./utils')

module.exports.handleError = (e, errorMessage) => {
  log(e)
  let errorName = _.findKey(ERRORS, val => val === errorMessage)
  if (!errorName) errorName = 'UNKNOWN_ERROR'
  const error = new Error(errorMessage)
  error.name = errorName
  error.stack = e.stack
  if (errorMessage) logError(errorMessage)
  throw error
}
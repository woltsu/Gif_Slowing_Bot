const { LOGGING } = require('./config')
const chalk = require('chalk')

const log = (...params) => {
  if (LOGGING) console.log(...params)
}

module.exports.log = log

module.exports.logError = (...params) => log(chalk.redBright(...params))
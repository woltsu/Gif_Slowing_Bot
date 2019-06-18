const { LOGGING } = require('./config')
const chalk = require('chalk')

const log = (...params) => {
  if (LOGGING) console.log(...params)
}

module.exports.log = log

module.exports.logError = (...params) => console.log(chalk.redBright(...params))
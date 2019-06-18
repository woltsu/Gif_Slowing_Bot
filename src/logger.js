const winston = require('winston')
const { combine, timestamp, label, printf } = winston.format

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const logger = winston.createLogger({
  format: combine(
    label({ label: 'logger' }),
    timestamp(),
    customFormat
  ),
  transports: [
    new winston.transports.Console()
  ]
})

module.exports = logger
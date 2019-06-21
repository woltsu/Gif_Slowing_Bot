const winston = require('winston')
const { combine, timestamp, label, printf } = winston.format

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`
})

const getLogger = (withLabel) => {
  const l = withLabel || 'logger'
  if (!winston.loggers.has(l)) {
    winston.loggers.add(l, {
      transports: [ new winston.transports.Console() ],
      format: combine(
        label({ label: l }),
        timestamp(),
        customFormat
      )
    })
  }
  return winston.loggers.get(l)
}

module.exports = getLogger
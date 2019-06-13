module.exports.handleError = (e, message) => {
  console.error(e)
  throw new Error(message)
}
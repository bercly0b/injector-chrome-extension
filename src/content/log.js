const { getTime } = require('../utils')

const log = msg => {
  console.group(`${getTime()} Injector:`)
  console.log('%c%s', 'color: #28a745;', msg[0].toUpperCase() + msg.slice(1))
  console.groupEnd()
}

module.exports = log
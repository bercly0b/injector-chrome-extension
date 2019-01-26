const getTime = () => {
  const now = new Date()
  const add0 = n => n > 9 ? n : '0' + n
  return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
}

const log = (msg, isError) => {
  const style = `color: ${isError ? '#dc3545' : '#28a745'}`
  console.group (`${getTime()} Injector:`)
  console.log('%c%s', style, msg[0].toUpperCase() + msg.slice(1))
  console.groupEnd()
}

module.exports = log
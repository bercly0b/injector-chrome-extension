const wrapScript = script => {
  return `
    const run = () => {
      ${script}
    }
    const check = setInterval(() => {
      if (typeof Kam !== 'undefined') {
        clearInterval(check)
        run()
      }
    }, 100)`
}

module.exports = wrapScript

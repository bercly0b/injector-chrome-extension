const wrapScript = script => {
  return `
    const run = () => {
      ${script}
    }
    const check = setInterval(() => {
      if (typeof Kameleoon !== 'undefined') {
        clearInterval(check)
        run()
      }
    }, 100)`
}

module.exports = wrapScript

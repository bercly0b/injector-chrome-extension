var log = getTime()
store.style && injectStyles(store.style)
store.script && injectScript(store.script)
store.log && console.log(log + 'was injected')


function getTime() {
  const now = new Date()
  const add0 = n => n > 9 ? n : '0' + n
  return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
}

function injectStyles(style) {
  document.body.insertAdjacentHTML('afterbegin', `<style data-from="injector">${style}</style>`)
  log += ' Style '
}

function injectScript(script) {
  const el = document.createElement('script')
  el.textContent = script
  el.setAttribute('data-from', 'injector')
  document.body.appendChild(el)
  if (log.length > 10) log += 'and script '
  else log += ' Script '
}

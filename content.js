console.log('--->', store)
var { style, script, reload } = store

if (style) injectStyles(style)
if (script) injectScript(script)
if (reload) location.reload()

function getTime() {
  const now = new Date()
  const add0 = n => n > 9 ? n : '0' + n
  return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
}

function injectStyles(style) {
  document.body.insertAdjacentHTML('afterbegin', `<style>${style}</style>`)
  console.log(`${getTime()} Style was injected`)
}

function injectScript(script) {
  const el = document.createElement('script')
  el.textContent = script
  document.body.appendChild(el)
  console.log(`${getTime()} Script was injected`)
}

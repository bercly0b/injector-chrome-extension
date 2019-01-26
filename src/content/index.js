const log = require('./log')
const wrapScript = require('./wrapScript')

const injected = []
store.style && injectStyles(store.style)
store.script && injectScript(store.script)

function injectStyles(style) {
  const box = document.querySelector('style[data-source="injector"]')
  if (box) box.innerHTML = style
  else {
    const el = `<style type="text/css" data-source="injector">${style}</style>`
    document.head.insertAdjacentHTML('beforeend', el)
  }
  return injected.push('style')
}

function injectScript(script) {
  const box = document.querySelector('script[data-source="injector"]')
  script = store.wait ? wrapScript(script) : script
  
  if (box) box.innerHTML = script
  else {
    const el = document.createElement('script')
    el.textContent = script
    el.setAttribute('data-source', 'injector')
    document.body.appendChild(el)
  }
  return injected.push('script')
}

injected.length && store.log && log(`${injected.join(' and ')} was injected`)

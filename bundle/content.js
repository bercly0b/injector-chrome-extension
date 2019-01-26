(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./log":2,"./wrapScript":3}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}]},{},[1]);

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
  const box = document.querySelector('style[data-source="injector"]')
  if (box) box.innerHTML = style
  else {
    const el = `<style type="text/css" data-source="injector">${style}</style>`
    document.head.insertAdjacentHTML('beforeend', el)
  }
  return log += ' Style '
}

function injectScript(script) {
  const box = document.querySelector('script[data-source="injector"]')
  if (box) box.innerHTML = script
  else {
    const el = document.createElement('script')
    el.textContent = script
    el.setAttribute('data-source', 'injector')
    document.body.appendChild(el)
  }
  if (log.length > 10) return log += 'and script '
  else return log += ' Script '
}

},{}]},{},[1]);

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const utils = require('./utils')

const { syncView, setState, checkKey, get } = utils
const view = {
  state: get('state'),
  livereload: get('livereload'),
  log: get('log'),
  css: get('css'),
  waitKam: get('wait'),
  port: get('port')
}

chrome.storage.local.get(['params'], ({ params = { active: {} } }) => {
  chrome.tabs.query({ active: true }, ([tab]) => {
    if (tab && params.active.id === tab.id) syncView(params, view)
    params.port && view.port.setAttribute('placeholder', params.port)
  })
})

view.state.addEventListener('input', function() {
  chrome.storage.local.get(['params'], ({ params }) => {
    if (this.checked) {
      chrome.tabs.query({ active: true }, ([tab]) => {
        const newParams = { ...params, active: tab }
        chrome.storage.local.set({ params: newParams }, () => syncView(newParams, view))
      })
    } else {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams }, () => syncView(newParams, view))
    }
  })
})

view.livereload.addEventListener('input', function() { setState('livereload', this.checked) })
view.log.addEventListener('input', function() { setState('log', this.checked) })
view.css.addEventListener('input', function() { setState('fastCss', this.checked) })
view.waitKam.addEventListener('input', function() { setState('wait', this.checked) })
view.port.addEventListener('change', function() { setState('port', this.value) })

view.port.addEventListener('keydown', function(ev) {
  if (checkKey(ev)) return false
  else {
    ev.preventDefault()
    return
  }
})

},{"./utils":2}],2:[function(require,module,exports){
const setState = (key, value) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const newParams = { ...params, [key]: value }
    chrome.storage.local.set({ params: newParams })
  })
}

const checkKey = event => {
  const { key } = event
  if (key === ' ') return false
  if (key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || !isNaN(key)) return true
  return false
}

const syncView = (params, view) => {
  const { active, livereload, log, port, fastCss, wait } = params

  if (active.id) {
    Object.values(view).forEach(e => e.removeAttribute('disabled'))
    view.port.setAttribute('disabled', 'true')
  } else {
    Object.values(view).forEach(e => e.setAttribute('disabled', true))
    view.port.removeAttribute('disabled')
  }

  view.state.checked = active.id
  view.livereload.checked = livereload
  view.log.checked = log
  view.css.checked = fastCss
  view.waitKam.checked = wait
  view.port.setAttribute('value', port)
}

const get = id => document.getElementById(id)

module.exports = { syncView, setState, checkKey, get }
},{}]},{},[1]);

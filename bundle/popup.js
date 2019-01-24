(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const get = id => document.getElementById(id)

const stateI = get('state')
const livereloadI = get('livereload')
const logI = get('log')
const cssI = get('css')
const portI = get('port')

chrome.storage.local.get(['params'], ({ params = { active: {} } }) => {
  chrome.tabs.query({ active: true }, ([tab]) => {
    if (tab && params.active.id === tab.id) syncView(params)
    params.port && portI.setAttribute('placeholder', params.port)
  })
})

stateI.addEventListener('input', function() {
  chrome.storage.local.get(['params'], ({ params }) => {
    if (this.checked) {
      chrome.tabs.query({ active: true }, ([tab]) => {
        const newParams = { ...params, active: tab }
        chrome.storage.local.set({ params: newParams }, () => syncView(newParams))
      })
    } else {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams }, () => syncView(newParams))
    }
  })
})

livereloadI.addEventListener('input', function() { setState('livereload', this.checked) })
logI.addEventListener('input', function() { setState('log', this.checked) })
cssI.addEventListener('input', function() { setState('fastCss', this.checked) })
portI.addEventListener('change', function() { setState('port', this.value) })

portI.addEventListener('keydown', function(ev) {
  if (checkKey(ev)) return false
  else {
    ev.preventDefault()
    return
  }
})

const syncView = params => {
  const { active, livereload, log, port, fastCss } = params
  const controls = [livereloadI, logI, cssI]

  if (active.id) {
    controls.forEach(e => e.removeAttribute('disabled'))
    portI.setAttribute('disabled', 'true')
  } else {
    controls.forEach(e => e.setAttribute('disabled', true))
    portI.removeAttribute('disabled')
  }

  stateI.checked = active.id
  livereloadI.checked = livereload
  logI.checked = log
  cssI.checked = fastCss
  portI.setAttribute('value', port)
}

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

},{}]},{},[1]);

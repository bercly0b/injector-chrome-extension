(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const executeScript = require('./executeScript')
const { getIcons, reloadPage, getLogMsg } = require('./utils')

const handleWsClose = tabId => ev => {
  const { wasClean, code } = ev  
  const message = `Websocket was ${
    wasClean ? 'closed' : `disconnected with error ${code}`
  }`

  chrome.tabs.executeScript(tabId, { code: getLogMsg(message, !wasClean) })

  chrome.storage.local.get(['params'], ({ params }) => {
    chrome.browserAction.setIcon({ tabId, path: getIcons('off') })
    const newParams = { ...params, active: { id: false } }
    chrome.storage.local.set({ params: newParams })
  })
}

const handleWsMessage = (domain, tabId) => ev => {
  const { data } = ev
  const type = data.slice(0, 2) === 'st' ? 'style' : 'script'
  const code = data.slice(2)

  chrome.storage.local.get([domain, 'params'], res => {
    const store = res[domain] || {}
    const { fastCss, livereload } = res.params

    if (store[type] && store[type] === code) return

    const newStore = { ...store, [type]: code }

    if (fastCss && type === 'style') {
      executeScript({ style: code }, tabId)
      chrome.storage.local.set({ [domain]: newStore })
    } else {
      chrome.storage.local.set({ [domain]: newStore }, () => reloadPage(livereload, tabId))
    }
  })
}

const connect = (domain, { tabId, title }, port = 9999) => {
  const socket = new WebSocket(`ws://localhost:${port}`)

  socket.addEventListener('message', handleWsMessage(domain, tabId))
  socket.addEventListener('close', handleWsClose(tabId))
  socket.addEventListener('open', () => {
    socket.send(title)
    chrome.browserAction.setIcon({ tabId, path: getIcons('on') })
    chrome.tabs.executeScript(tabId, {
      code: getLogMsg('Websocket is connected successfully')
    })
  }) 
  return socket
}

module.exports = connect
},{"./executeScript":2,"./utils":4}],2:[function(require,module,exports){
const executeScript = (store, tabId) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const { log, wait } = params
    chrome.tabs.executeScript(
      tabId,
      { code: `var store = ${JSON.stringify({ ...store, log, wait })}` },
      () => {
        chrome.tabs.executeScript(tabId, { file: 'content.js' })
      }
    )
  })
}

module.exports = executeScript
},{}],3:[function(require,module,exports){
const connect = require('./connect')
const executeScript = require('./executeScript')
const { getDomain, getIcons } = require('./utils')
let socket = null

// on params change
chrome.storage.onChanged.addListener(changes => {
  const { params } = changes
  if (params && params.newValue.port) trySwitchState(params.newValue, params.oldValue)
})

// on page load/reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { status } = changeInfo

  if (status && status === 'loading') {
    const domain = getDomain(tab.url)

    chrome.storage.local.get([domain, 'params'], res => {
      const { params } = res
      if (params.active && params.active.id === tabId) {
        chrome.browserAction.setIcon({ tabId, path: getIcons('on') })
        const store = res[domain]
        executeScript(store, tabId)
      }
    })
  }
})

// on close work tab
chrome.tabs.onRemoved.addListener((id) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const { active } = params
    if (active.id && active.id === id) {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams })
    }
  })
})

const trySwitchState = (next, prev = {}) => {
  if (next.active && (!prev.active || prev.active.id !== next.active.id)) {
    switchState(next.active, next.port)
  }
}

const switchState = (tab, port) => {
  socket && socket.close()
  socket = null

  if (tab.id) {
    const domain = getDomain(tab.url)
    if (!socket) socket = connect(domain, tab, port)

    chrome.storage.local.get([domain], res => {
      const store = res[domain]
      executeScript(store, tab.id)
    })
  }
}

},{"./connect":1,"./executeScript":2,"./utils":4}],4:[function(require,module,exports){
const { getTime } = require('../utils')

const reloadPage = (needReload, tabId) => {
  if (needReload) chrome.tabs.executeScript(tabId, { code: 'location.reload()' })
}

const getDomain = url => {
  const begin = url.startsWith('https') ? 8 : 7
  const withoutProtocol = url.slice(begin)
  const beginPath = withoutProtocol.indexOf('/')
  if (!~beginPath) return withoutProtocol
  return withoutProtocol.slice(0, withoutProtocol.indexOf('/'))
}

const getIcons = state => {
  return {
    '64': `icons/${state}-64.png`,
    '128': `icons/${state}-128.png`
  }
}

const getLogMsg = (msg, isError) => {
  const style = `color: ${isError ? '#dc3545' : '#28a745'}`
  return `
    console.group('${getTime()} Injector:');
    console.log('%c%s', '${style}', '${msg}');
    console.groupEnd();
  `
}

module.exports = { reloadPage, getDomain, getIcons, getLogMsg }

},{"../utils":5}],5:[function(require,module,exports){
const getTime = () => {
  const now = new Date()
  const add0 = n => n > 9 ? n : '0' + n
  return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
}

module.exports = { getTime }
},{}]},{},[3]);

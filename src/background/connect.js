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

const connect = (domain, { id: tabId, title }, port = 9999) => {
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
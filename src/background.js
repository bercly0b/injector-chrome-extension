let socket = null

// on params change
chrome.storage.onChanged.addListener((changes) => {
  const { params, reconnect } = changes

  if (params) {
    const { newValue, oldValue } = params
    if (oldValue.active.id !== newValue.active.id) switchState(newValue.active, newValue.port)
  }
  // if (reconnect) {
  //   const { newValue, oldValue } = reconnect
  // }
})

// on page load/reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

  console.log(changeInfo)
  const { status } = changeInfo

  if (status && status === 'complete') {
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

const getDomain = url => {
  const begin = url.startsWith('https') ? 8 : 7
  const withoutProtocol = url.slice(begin)
  const beginPath = withoutProtocol.indexOf('/')
  if (!~beginPath) return withoutProtocol
  return withoutProtocol.slice(0, withoutProtocol.indexOf('/'))
}

const switchState = (tab, port) => {
  socket && socket.close()
  socket = null

  if (tab.id) {
    const domain = getDomain(tab.url)
    if (!socket) socket = connect(domain, tab.id, port)

    chrome.storage.local.get([domain], res => {
      const store = res[domain]
      executeScript(store, tab.id)
    })
  }
}

const connect = (domain, tabId, port = 9999) => {
  const socket = new WebSocket(`ws://localhost:${port}`)

  socket.onclose = ev => {
    chrome.browserAction.setIcon({ tabId, path: getIcons('off') })

    chrome.storage.local.get(['params'], ({ params }) => {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams }, () => syncView(newParams))
      chrome.tabs.executeScript(
        tabId, 
        { code: `console.log('[injector] Websocket was disconnected (code: ${ev.code})')` }
      )
    })
  }

  socket.onopen = () => {
    chrome.browserAction.setIcon({ tabId, path: getIcons('on') })
  }

  socket.onmessage = ev => {
    const { data } = ev
    const type = data.slice(0, 2) === 'st' ? 'style' : 'script'
    const code = data.slice(2)

    chrome.storage.local.get([domain], res => {
      if (res[domain][type] === code) return
      const store = { ...res[domain], [type]: code }
      chrome.storage.local.set({ [domain]: store }, () => reloadPage(tabId))
    })
  }

  socket.onerror = err => {
    chrome.tabs.executeScript(tabId, { code: `console.log('Websocket error: ${err}')` })
  }

  return socket
}

const reloadPage = tabId => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const { livereload } = params
    if (livereload) chrome.tabs.executeScript(tabId, { code: 'location.reload()' })
  })
}

const executeScript = (store, tabId) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const { log } = params
    chrome.tabs.executeScript(
      tabId,
      { code: `var store = ${JSON.stringify({ ...store, log })}` },
      () => {
        chrome.tabs.executeScript(tabId, {file: 'src/content.js'})
      }
    )
  })
}

const getIcons = state => {
  return {
    '64': `icons/${state}-64.png`,
    '128': `icons/${state}-128.png`
  }
}

let socket = null

// on params change
chrome.storage.onChanged.addListener(changes => {
  const { params } = changes
  if (params) trySwitchStateForParams(params)
})

// on page load/reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(changeInfo)

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

const trySwitchStateForParams = ({ newValue, oldValue = { active: {} } }) => {
  if (newValue && oldValue.active.id !== newValue.active.id) {
    switchState(newValue.active, newValue.port)
  }
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

  socket.onmessage = handleWsMessage(domain, tabId)
  socket.onclose = handleWsClose(tabId)
  socket.onopen = () => chrome.browserAction.setIcon({ tabId, path: getIcons('on') })

  return socket
}

const executeScript = (store, tabId) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const { log } = params
    chrome.tabs.executeScript(
      tabId,
      { code: `var store = ${JSON.stringify({ ...store, log })}` },
      () => {
        chrome.tabs.executeScript(tabId, { file: 'src/content.js' })
      }
    )
  })
}

const handleWsClose = tabId => ev => {
  const { wasClean, code } = ev
  let message = 'Websocket was '
  if (wasClean) message += 'closed.'
  else message += `disconnected with error ${code}`

  chrome.tabs.executeScript(tabId, {
    code: `console.log('[Injector] ${message}')`
  })
  
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

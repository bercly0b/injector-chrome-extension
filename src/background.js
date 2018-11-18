let socket = null
// on icon click
// chrome.browserAction.onClicked.addListener(tab => {
//   const domain = getDomain(tab.url)
//   chrome.storage.local.get([domain], switchState(domain, tab))
// })

// on switch tab
chrome.tabs.onActivated.addListener(ev => {
  chrome.tabs.get(ev.tabId, tab => {
    const domain = getDomain(tab.url)

    chrome.storage.local.get([domain], result => {
      const store = result[domain]
      if (store && store.state) chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('on') })
    })
  })
})

// on page load/reload
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { favIconUrl } = changeInfo

  if (favIconUrl) {
    const domain = getDomain(tab.url)

    chrome.storage.local.get([domain], result => {
      const store = result[domain]
      if (store && store.state) {
        executeScript(store)
        chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('on') })
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

const switchState = (domain, tab) => result => {
  const store = result[domain]
  if (store && store.state) {
    chrome.storage.local.set({ [domain]: { ...store, state: false } }, () => {
      chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('off') })
      if (socket) {
        socket.close()
        socket = null
      }
      console.log('off')
    })
  } else {
    if (!socket) socket = connect(domain)
    chrome.storage.local.set({ [domain]: { ...store, state: true } }, () => {
      executeScript(store)
      chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('on') })
      console.log('on')
    })
  }
}


const connect = domain => {
  const socket = new WebSocket('ws://localhost:9999')

  socket.onclose = function(ev) {
    console.log(`${getTime()} Websocket was disconnected (code: ${ev.code})`)
  }

  socket.onmessage = function(ev) {
    const { data } = ev
    const type = data.slice(0, 2) === 'st' ? 'style' : 'script'

    chrome.storage.local.get([domain], result => {
      const store = { ...result[domain], [type]: data.slice(2) }
      chrome.storage.local.set({ [domain]: store }, () => {
        chrome.tabs.executeScript({ code: 'location.reload()' })
      })
    })
  }

  socket.onerror = function(err) {
    console.log(`${getTime()} Websocket error: ${err.message}`)
  }

  return socket
}

const executeScript = store => {
  chrome.tabs.executeScript({ code: `var store = ${JSON.stringify(store)}` }, () => {
      chrome.tabs.executeScript({file: 'src/content.js'});
  })
}

const getIcons = state => {
  return {
    '64': `icons/${state}-64.png`,
    '128': `icons/${state}-128.png`
  }
}

const getTime = () => {
  const now = new Date()
  const add0 = n => n > 9 ? n : '0' + n
  return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
}

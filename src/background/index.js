const connect = require('./connect')
const executeScript = require('./executeScript')
const { getDomain, getIcons } = require('./utils')
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

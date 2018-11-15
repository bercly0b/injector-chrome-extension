chrome.browserAction.onClicked.addListener(tab => {
  const domain = getDomain(tab.url)
  chrome.storage.local.get([domain], checkDomain(domain, tab))
})

chrome.tabs.onActivated.addListener(ev => {
  chrome.tabs.get(ev.tabId, tab => {
    const domain = getDomain(tab.url)

    chrome.storage.local.get([domain], result => {
      if (result[domain]) chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('on') })
    })
  })
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const { favIconUrl } = changeInfo

  if (favIconUrl) {
    console.log('--->', 'update')
    const domain = getDomain(tab.url)

    chrome.storage.local.get([domain], result => {
      if (result[domain]) {
        chrome.tabs.executeScript({ file: 'contentScript.js' })
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


const checkDomain = (domain, tab) => result => {
  if (result[domain]) {
    chrome.storage.local.set({ [domain]: false }, () => {
      chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('off') })
      console.log('off')
    })
  } else {
    chrome.storage.local.set({ [domain]: true }, () => {
      chrome.tabs.executeScript({ file: 'contentScript.js' })
      chrome.browserAction.setIcon({ tabId: tab.id, path: getIcons('on') })
      console.log('on')
    })
  }
}

const getIcons = state => {
  return {
    '64': `icons/${state}-64.png`,
    '128': `icons/${state}-128.png`
  }
}

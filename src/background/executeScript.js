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
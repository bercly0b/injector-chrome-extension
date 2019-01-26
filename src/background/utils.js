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

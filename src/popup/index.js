const syncView = require('./syncView')
const { setState, get } = require('./utils')

const view = {
  state: get('state'),
  livereload: get('livereload'),
  log: get('log'),
  css: get('css'),
  waitKam: get('wait'),
  port: get('port')
}

chrome.storage.local.get(['params'], ({ params = { active: {} } }) => {
  chrome.tabs.query({ active: true }, ([tab]) => {
    if (tab && params.active.id === tab.id) syncView(params, view)
    params.port && view.port.setAttribute('placeholder', params.port)
  })
})

view.state.addEventListener('input', function() {
  chrome.storage.local.get(['params'], ({ params }) => {
    if (this.checked) {
      chrome.tabs.query({ active: true }, ([tab]) => {
        const newParams = { ...params, active: tab }
        chrome.storage.local.set({ params: newParams }, () => syncView(newParams, view))
      })
    } else {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams }, () => syncView(newParams, view))
    }
  })
})

view.livereload.addEventListener('input', function() { setState('livereload', this.checked) })
view.log.addEventListener('input', function() { setState('log', this.checked) })
view.css.addEventListener('input', function() { setState('fastCss', this.checked) })
view.waitKam.addEventListener('input', function() { setState('wait', this.checked) })
view.port.addEventListener('input', function() { setState('port', this.value) })

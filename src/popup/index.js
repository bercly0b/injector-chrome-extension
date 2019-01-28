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

// sync popup view on open
chrome.storage.local.get(['params'], ({ params = { active: {} } }) => {
  if (!params.port) {
    view.state.setAttribute('disabled', true)
    view.port.focus()
  }

  chrome.tabs.query({ active: true }, tabs => {
    chrome.windows.getCurrent({}, ({ id: activeWindowId }) => {
      const activeTab = tabs.find(({ windowId }) => windowId === activeWindowId)
      if (params.active.id === activeTab.id) syncView(params, view)
      params.port && view.port.setAttribute('placeholder', params.port)
    })
  })
})

// controlls handlers
view.state.addEventListener('input', function() {
  chrome.storage.local.get(['params'], ({ params = {} }) => {
    if (this.checked && params.port) {
      chrome.tabs.query({ active: true }, tabs => {
        chrome.windows.getCurrent({}, ({ id: activeWindowId }) => {
          const activeTab = tabs.find(({ windowId }) => windowId === activeWindowId)
          const newParams = { ...params, active: activeTab }
          chrome.storage.local.set({ params: newParams }, () => syncView(newParams, view))
        })
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
view.port.addEventListener('input', function() {
  setState('port', +this.value)
  view.state.removeAttribute('disabled', true)
})

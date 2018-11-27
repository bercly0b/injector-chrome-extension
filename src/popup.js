const get = id => document.getElementById(id)

const stateI = get('state')
const livereloadI = get('livereload')
const logI = get('log')
const portI = get('port')
const reconnectI = get('reconnect')

chrome.storage.local.get(['params'], ({ params }) => {
  chrome.tabs.query({ active: true }, ([tab]) => {
    if (params.active.id === tab.id) syncView(params)
    params.port && portI.setAttribute('placeholder', params.port)
  })
})

stateI.addEventListener('input', function() {
  chrome.storage.local.get(['params'], ({ params }) => {
    if (this.checked) {
      chrome.tabs.query({ active: true }, ([tab]) => {
        const newParams = { ...params, active: tab }
        chrome.storage.local.set({ params: newParams }, () => syncView(newParams))
      })
    } else {
      const newParams = { ...params, active: { id: false } }
      chrome.storage.local.set({ params: newParams }, () => syncView(newParams))
    }
  })
})

livereloadI.addEventListener('input', function() { setState('livereload', this.checked) })
logI.addEventListener('input', function() { setState('log', this.checked) })
portI.addEventListener('change', function() { setState('port', this.value) })

portI.addEventListener('keydown', function(ev) {
  if (checkKey(ev)) return false
  else {
    ev.preventDefault()
    return
  }
})

reconnectI.addEventListener('click', function() {
  chrome.storage.local.set({ reconnect: portI.value })
})

const syncView = params => {
  const { active, livereload, log, port } = params
  const controls = [livereloadI, logI, reconnectI]

  if (active.id) controls.forEach(e => e.removeAttribute('disabled'))
  else controls.forEach(e => e.setAttribute('disabled', true))

  stateI.checked = active.id
  livereloadI.checked = livereload
  logI.checked = log
  portI.setAttribute('placeholder', port)
}

const setState = (key, value) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const newParams = { ...params, [key]: value }
    chrome.storage.local.set({ params: newParams })
  })
}

const checkKey = event => {
  const { key } = event
  if (key === ' ') return false
  if (key === 'Backspace' || !isNaN(key)) return true
  return false
}

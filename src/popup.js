const get = id => document.getElementById(id)

const stateI = get('state')
const livereloadI = get('livereload')
const logI = get('log')
const portI = get('port')

chrome.storage.local.get(['params'], ({ params = { active: {} } }) => {
  chrome.tabs.query({ active: true }, ([tab]) => {
    if (tab && params.active.id === tab.id) syncView(params)
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

const syncView = params => {
  const { active, livereload, log, port } = params
  const controls = [livereloadI, logI]

  if (active.id) {
    controls.forEach(e => e.removeAttribute('disabled'))
    portI.setAttribute('disabled', 'true')
  } else {
    controls.forEach(e => e.setAttribute('disabled', true))
    portI.removeAttribute('disabled')
  }

  stateI.checked = active.id
  livereloadI.checked = livereload
  logI.checked = log
  portI.setAttribute('value', port)
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

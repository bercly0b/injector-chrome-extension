const setState = (key, value) => {
  chrome.storage.local.get(['params'], ({ params }) => {
    const newParams = { ...params, [key]: value }
    chrome.storage.local.set({ params: newParams })
  })
}

const checkKey = event => {
  const { key } = event
  if (key === ' ') return false
  if (key === 'Backspace' || key === 'ArrowLeft' || key === 'ArrowRight' || !isNaN(key)) return true
  return false
}

const syncView = (params, view) => {
  const { active, livereload, log, port, fastCss, wait } = params

  if (active.id) {
    Object.values(view).forEach(e => e.removeAttribute('disabled'))
    view.port.setAttribute('disabled', 'true')
  } else {
    Object.values(view).forEach(e => e.setAttribute('disabled', true))
    view.port.removeAttribute('disabled')
  }

  view.state.checked = active.id
  view.livereload.checked = livereload
  view.log.checked = log
  view.css.checked = fastCss
  view.waitKam.checked = wait
  view.port.setAttribute('value', port)
}

const get = id => document.getElementById(id)

module.exports = { syncView, setState, checkKey, get }
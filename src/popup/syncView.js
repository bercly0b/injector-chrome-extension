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
  view.port.setAttribute('value', +port)
}

module.exports = syncView
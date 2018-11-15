;(() => {
  const style = sessionStorage.getItem('injectedCss')
  const script = sessionStorage.getItem('injectedJs')

  const getTime = () => {
    const now = new Date()
    const add0 = n => n > 9 ? n : '0' + n
    return `[${add0(now.getHours())}:${add0(now.getMinutes())}:${add0(now.getSeconds())}]`
  }

  const injectStyles = styles => {
    document.body.insertAdjacentHTML('afterbegin', `<style>${styles}</style>`)
    console.log(`${getTime()} Style was injected`)
  }

  const injectScript = script => {
    const el = document.createElement('script')
    el.textContent = script
    document.body.appendChild(el)
    console.log(`${getTime()} Script was injected`)
  }

  if (style) injectStyles(style)
  if (script) injectScript(script)

  const socket = new WebSocket('ws://localhost:9999')

  socket.onclose = function(ev) {
    console.log(`${getTime()} Websocket was disconnected (code: ${ev.code})`)
  }

  socket.onmessage = function(ev) {
    const { data } = ev
    const type = data.slice(0, 2) === 'st' ? 'Css' : 'Js'
    sessionStorage.setItem('injected' + type, data.slice(2))
    location.reload()
  }

  socket.onerror = function(err) {
    console.log(`${getTime()} Websocket error: ${err.message}`)
  }

})()

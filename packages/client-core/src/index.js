import Connection from '@xmpp/connection'
import url from 'url'

// we ignore url module from the bundle to reduce its size
function getHostname (uri) {
  if (url.parse) {
    return url.parse(uri).hostname
  } else {
    const el = document.createElement('a')
    el.href = uri
    return el.hostname
  }
}

class Client extends Connection {
  constructor (options) {
    super(options)
    this.transports = []
    this.uri = ''
  }

  connect (uri) {
    let params
    const Transport = this.transports.find(Transport => {
      return params = Transport.match(uri) // eslint-disable-line no-return-assign
    })

    // FIXME callback?
    if (!Transport) throw new Error('No transport found')

    const sock = this.socket = new Transport()

    ;[
      'error', 'close', 'connect',
      'features', 'element', 'stanza',
      'nonza'
    ].forEach(e => {
      sock.on(e, (...args) => this.emit(e, ...args))
    })

    return sock.connect(params)
      .then(() => {
        this.uri = uri
        return params
      })
  }

  open (domain, ...args) {
    domain = domain || getHostname(this.uri)

    return this.socket.open(domain, ...args)
  }

  get features () { // FIXME remove
    return this.socket.features
  }
}

Client.prototype.NS = 'jabber:client'

export {getHostname}
export default Client

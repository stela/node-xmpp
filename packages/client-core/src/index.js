import Entity from '@xmpp/entity'
import url from 'url'

const NS = 'jabber:client'

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

class Client extends Entity {
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

    this.connection = new Transport()

    return super.connect(params)
      .then(() => {
        this.uri = uri
        return params
      })
  }

  open (domain, ...args) {
    domain = domain || getHostname(this.uri)

    return super.open(domain, ...args)
  }

  close () {
    return super.close()
  }

  _restart (domain = this._domain) {
    return this.connection.restart(domain)
  }

  send (stanza) {
    return this.connection.send(stanza)
  }
}

export {NS, getHostname}
export default Client

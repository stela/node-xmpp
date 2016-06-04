import Connection from '@xmpp/connection'

export const NS_STREAM = 'http://etherx.jabber.org/streams'

class Outgoing extends Connection {
  constructor () {
    super()

    this._domain = ''
    const sock = this.socket
    sock.on('connect', this._connectListener.bind(this))
  }

  _connectListener () {
    this.online = true
    this.emit('connect')
  }

  connect (options) {
    return new Promise((resolve, reject) => {
      this.socket.connect(options, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }

  open (domain, lang = 'en') {
    return new Promise((resolve, reject) => {
      // FIXME timeout
      this.waitHeader(domain, lang, () => {
        this._domain = domain
        this.emit('open')

        // FIXME timeout
        this.once('element', el => {
          if (el.name !== 'stream:features') return // FIXME error

          this.emit('features', el)
          resolve(el)
        })
      })
      this.write(this.header(domain, lang))
    })
  }

  restart (domain, lang) {
    return this.open(domain, lang)
  }
}

export default Outgoing

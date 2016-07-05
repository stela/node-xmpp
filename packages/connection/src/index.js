import EventEmitter from 'events'
import StreamParser from '@xmpp/streamparser'

class Connection extends EventEmitter {
  constructor (options) {
    super()
    this.online = false
    this._domain = ''
    this.jid = null
    this.options = typeof options === 'object' ? options : {}
    this.plugins = []

    if (this.Socket && this.Parser) {
      this._handle(new this.Socket(), new this.Parser())
    }
  }

  _handle (socket, parser) {
    const errorListener = (error) => {
      this.emit('error', error)
    }

    // socket
    const sock = this.socket = socket
    const dataListener = (data) => {
      this.parser.write(data.toString('utf8'))
    }
    const closeListener = () => {
      this._domain = ''
      this.online = false
      this.emit('close')
    }
    const connectListener = () => {
      this.online = true
      this.emit('connect')
    }
    sock.on('data', dataListener)
    sock.on('error', errorListener)
    sock.on('close', closeListener)
    sock.on('connect', connectListener)

    // parser
    this.parser = parser
    const elementListener = (element) => {
      this.emit('element', element)
      this.emit(this.isStanza(element) ? 'stanza': 'nonza', element)
    }
    parser.on('element', elementListener)
    parser.on('error', errorListener)
  }

  id () {
    return Math.random().toString().split('0.')[1]
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
          this.features = el // FIXME remove that
          this.emit('features', el)
          resolve(el)
        })
      })
      this.write(this.header(domain, lang))
    })
  }

  restart (...args) {
    return this.open(...args)
  }

  send (element) {
    element = element.root()

    const {name} = element
    const NS = element.getNS()
    if (NS !== this.NS && name === 'iq' || name === 'message' || name === 'presence') {
      element.attrs.xmlns = this.NS
    }

    return this.write(element)
  }

  write (data) {
    return new Promise((resolve, reject) => {
      this.socket.write(data.toString().trim(), resolve)
    })
  }

  isStanza (element) {
    const {name} = element
    return this.online &&
      element.getNS() === this.NS &&
      (name === 'iq' || name === 'message' || name === 'presence')
  }

  isNonza (element) {
    return !this.isStanza(element)
  }

  close () {
    return new Promise((resolve, reject) => {
      // TODO timeout
      const handler = () => {
        this.socket.close()
        this.once('close', resolve)
      }
      this.parser.once('end', handler)
      this.write(this.footer())
    })
  }

  use (plugin) {
    if (this.plugins.includes(plugin)) return
    this.plugins.push(plugin)
    plugin(this)
  }

  // override
  waitHeader () {}
  header () {}
  footer () {}
  match () {}
}

// overrirde
Connection.prototype.NS = ''
Connection.prototype.Socket = null
Connection.prototype.Parser = StreamParser

export default Connection

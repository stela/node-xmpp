import EventEmitter from 'events'
import StreamParser from '@xmpp/streamparser'

class Connection extends EventEmitter {
  constructor () {
    super()
    this.online = false

    // socket
    const sock = this.socket = new this.Socket()
    sock.on('data', this._dataListener.bind(this))
    sock.on('error', this._errorListener.bind(this))
    sock.on('close', this._closeListener.bind(this))

    // parser
    const parser = this.parser = new this.Parser()
    parser.on('element', this._elementListener.bind(this))
    parser.on('error', this._errorListener.bind(this))
  }

  _elementListener (element) {
    this.emit('element', element)
    this.emit(this.isStanza(element) ? 'stanza': 'nonza', element)
  }

  _dataListener (data) {
    this.parser.write(data.toString('utf8'))
  }

  _closeListener () {
    this.online = false
    this.emit('close')
  }

  _errorListener (error) {
    this.emit('error', error)
  }

  id () {
    return Math.random().toString().split('0.')[1]
  }

  send (element) {
    element = element.root()

    if (this.online) {
      const {name} = element
      const NS = element.getNS()
      if (NS !== this.NS && name === 'iq' || name === 'message' || name === 'presence') {
        element.attrs.xmlns = this.NS
      }
    }

    this.write(element)
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
}

// overrirde
Connection.prototype.NS = ''
Connection.prototype.Socket = null
Connection.prototype.Parser = StreamParser

export default Connection

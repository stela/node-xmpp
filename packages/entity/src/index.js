import EventEmitter from 'events'

export default class Entity extends EventEmitter {
  constructor (options) {
    super()
    this.plugins = []
    this.connection = null
    this.jid = null
    this.online = false
    this._domain = ''
    this.options = typeof options === 'object' ? options : {}
  }

  id () {
    return Math.random().toString().split('0.')[1]
  }

  connect (params) {
    const conn = this.connection

    ;[
      'element', 'stanza', 'nonza',
      'features', 'connect', 'close', 'error'
    ].forEach(e => {
      conn.on(e, (...args) => this.emit(e, ...args))
    })

    conn.on('close', () => this._domain = '')

    return conn.connect(params)
  }

  open (domain, lang) {
    return this.connection
      .open(domain, lang)
      .then(features => {
        this.features = features // FIXME remove that
        this._domain = domain
        return features
      })
  }

  close () {
    return this.connection.close()
  }

  _restart (domain = this._domain) {
    return this.connection.restart(domain)
  }

  send (stanza) {
    return this.connection.send(stanza)
  }

  use (plugin) {
    if (this.plugins.includes(plugin)) return
    this.plugins.push(plugin)
    plugin(this)
  }
}

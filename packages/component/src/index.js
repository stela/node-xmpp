import Entity from '@xmpp/entity'

/*
 * References
 * https://xmpp.org/extensions/xep-0114.html
 */

const NS = 'jabber:component:accept'

class Component extends Entity {
  constructor (options) {
    super(options)
  }

  connect (params) {
    this.connection = new TCP() // blabla
    return super.connect(params)
  }

  open (params = {}) {
    if (typeof params === 'string') {
      params = {domain: params}
    }

    const domain = params.domain || getHostname(this.uri)

    return this.transport
      .open(domain)
      .then(features => {
        this._domain = domain
        this.features = features
        this.emit('open', features)
        return features
      })
  }

  close () {
    return this.connection.close()
  }

  send (stanza) {
  }

  use (plugin) {
    if (this.plugins.includes(plugin)) return
    this.plugins.push(plugin)
    plugin(this)
  }
}

export {NS}
export default Component

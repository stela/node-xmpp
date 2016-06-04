import Outgoing from '@xmpp/connection-outgoing'

class Connection extends Outgoing {
  // override
  static match (uri) {}
}

Connection.prototype.NS = 'jabber:client'

export default Connection

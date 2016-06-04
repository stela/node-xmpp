import Connection from '@xmpp/connection'

class Incoming extends Connection {
  constructor () {
    super()
    this.online = true
  }
}

export default Incoming

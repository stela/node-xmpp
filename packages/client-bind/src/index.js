/*
 * References
 * https://xmpp.org/rfcs/rfc6120.html#bind
 */

// FIXME let's not use client-iq-caller here
import {request} from '@xmpp/client-iq-caller'

const NS = 'urn:ietf:params:xml:ns:xmpp-bind'

function stanza (resource) {
  return (
    <iq type='set'>
      <bind xmlns={NS}>{
      resource
      ? <resource>{resource}</resource>
      : null
      }
      </bind>
    </iq>
  )
}

function match (features) {
  return features.getChild('bind', NS)
}

function bind (client, resource) {
  return request(client, stanza(resource), {next: true})
    .then(result => {
      return client._online(result.getChild('jid').text())
    })
}

function clientBind (...args) {
  bind(this, ...args)
}

function plugin (client) {
  client.bind = clientBind
  if (client.registerStreamFeature) {
    client.registerStreamFeature(streamFeature)
  }
}

const streamFeature = {
  priority: 2000,
  match: match,
  run: (client) => {
    return bind(client, client.options.resource)
  }
}

export default plugin
export {NS, stanza, match, bind, clientBind, plugin, streamFeature}

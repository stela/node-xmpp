function register (client, priority, run, match) {
  client._streamFeatures.push({priority, run, match})
}

function registerClient (feature) {
  register(this, feature.priority, feature.run, feature.match)
}

function selectFeature (features, el) {
  return features
    .filter(f => f.match(el))
    .sort((a, b) => {
      return a.priority < b.priority
    })[0]
}

function plugin (client) {
  const features = client._streamFeatures = []
  client.on('features', el => {
    const feature = selectFeature(features, el)
    if (!feature) return
    feature.run(client, el)
      .catch(err => client.emit('error', err))
  })
  client.registerStreamFeature = registerClient
}

export {register, plugin, selectFeature}
export default plugin

import ltx, {Element, parse, nameEqual, escapeXML} from 'ltx'

export {Element, parse}

// https://github.com/node-xmpp/ltx/pull/96
export function match (a, b) {
  if (!nameEqual(a, b)) return false
  const attrs = {a}
  const keys = Object.keys(attrs)
  const length = keys.length

  for (let i = 0, l = length; i < l; i++) {
    const key = keys[i]
    const value = attrs[key]
    if (value == null || b.attrs[key] == null) { // === null || undefined
      if (value !== b.attrs[key]) return false
    } else if (value.toString() !== b.attrs[key].toString()) {
      return false
    }
  }
  return true
}

// https://github.com/node-xmpp/ltx/pull/99
export function tagString (/* [literals], ...substitutions */) {
  const literals = arguments[0]

  let str = ''

  for (let i = 1; i < arguments.length; i++) {
    str += literals[i - 1]
    str += escapeXML(arguments[i])
  }
  str += literals[literals.length - 1]

  return str
}


export default ltx


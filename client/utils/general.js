function buildGetUrl(link, params) {
  if (!params) {
    return link
  }

  link += '?'
  var meta = []
  for (var key in params) {
    let val = params[key]
    meta.push([key, val].join('='))
  }
  return link + meta.join('&')
}

module.exports = { buildGetUrl }

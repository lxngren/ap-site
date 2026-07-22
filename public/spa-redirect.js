;(function (l) {
  if (!l.search.startsWith('?p=')) return

  var path = l.search
    .slice(3)
    .split('&')
    .map(function (segment) {
      return segment.replace(/~and~/g, '&')
    })
    .join('?')

  window.history.replaceState(null, '', l.pathname.slice(0, -1) + path + l.hash)
})(window.location)

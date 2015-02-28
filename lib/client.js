var events = require('../')
var sse = require('sse-stream')
var extend = require('extend')
var _port = parseInt(process.env.GLSLIFY_LIVE_PORT || 12875)

var watchers = {}
var requireCache = {}

module.exports = function(id, object, port) {
  port = port || _port
  watchers[port] = watchers[port] || sse('http://localhost:' + port + '/changes')

  var watcher = watchers[port]
  watcher.setMaxListeners(10000)

  //cache the object to respect the way require() works
  if (id in requireCache)
    object = requireCache[id]
  else {
    requireCache[id] = object
    watcher.on('data', respond)
  }

  function respond(query) {
    query = JSON.parse(query)

    //report errors in browser console
    if (query.error) {
      return console.error([
        query.file,
        query.error
      ].join('\n'))
    }

    if (id !== query._id) 
      return

    //empty the cached object
    var jsonData = query.data
    for (var k in object) {
      if (object.hasOwnProperty(k))
        delete object[k]
    }

    //mixin all new properties
    extend(true, object, jsonData)
    events.emit('update', object, id)
  }
  return object
}
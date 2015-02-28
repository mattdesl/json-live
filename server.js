var qs = require('querystring')
var sse = require('sse-stream')
var chokidar = require('chokidar')
var http = require('http')
var url = require('url')
var fs = require('fs')

var port = parseInt(process.env.JSON_LIVE_PORT || 12875)

module.exports = createServer

if (!module.parent) {
  createServer().listen(port, function(err) {
    if (err) throw err
    console.log('http://localhost:'+port)
  })
}

function createServer(opt) {
  var server = http.createServer(handler)
  var watcher = chokidar.watch([])
  var ping = sse('/changes')
  var connections = []
  var files = []
  var ids = {}

  ping.on('connection', function(client) {
    connections.push(client)
    client.once('close', function() {
      var idx = connections.indexOf(client)
      if (idx !== -1) connections.splice(idx, 1)
    })
  }).install(server)

  // Force Access-Control-Allow-Origin everywhere,
  // including the SSE stream handlers
  var listeners = server.listeners('request')
  server.removeAllListeners('request')
  server.on('request', function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    for (var i = 0; i < listeners.length; i++) {
      listeners[i].call(server, req, res)
    }
  })

  server.on('close', function() {
    watcher.close()
  })

  watcher.on('change', function(name) {
    var id = ids[name]
    console.log("change", id)

    readJSON(id, name, function(err, data) {
      if (err)
        writeConnections({ error: err.toString(), file: name })
      else
        writeConnections(data)
    })
    
  })

  return server

  function readJSON(id, file, cb) {
    fs.readFile(file, 'utf8', function(err, contents) {
      if (err) {
        cb(err)
      } else {
        try {
          cb(null, {
            _id: id, 
            data: JSON.parse(contents)
          })
        } catch (e) {
          cb(e)
        }
      }
    })
  }

  function writeConnections(data) {
    data = JSON.stringify(data)
    for (var i = 0; i < connections.length; i++) {
      connections[i].write(data)
    }
  }

  function handler(req, res) {
    var uri = req.url
    req.url = url.parse(req.url).pathname
    var query = qs.parse(url.parse(uri).query)
    var split = req.url.split(/\/+/g).slice(1)
    if (!query.data) return bail('Missing data', req, res)
    if (submit(req, res, query, split)) return
    return bail('Invalid URL', req, res)
  }

  function submit(req, res, query, split) {
    if (split[0]!=='submit') return false

    var data = JSON.parse(query.data)
    var id = data._id
    var cd = data._cd
    delete data._id
    delete data._cd

    ids[data.path] = id
    if (files.indexOf(data.path) === -1) {
      console.log("WATCHING", data.path, id)
      watcher.add(data.path)
      files.push(data.path)
    }

    res.end()
    return true
  }

}

function bail(err, req, res) {
  if (typeof err === 'string') err = new Error(err)
  var message = [err.message, err.stack].join('\n')

  res.statusCode = 500
  if (!res.headersSent) {
    res.setHeader('content-type', 'text/plain')
  }
  res.end(message)
  console.error(message)
}
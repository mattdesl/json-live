#!/usr/bin/env node
require('bole').output({
  level: 'debug',
  stream: process.stdout
})

var create = require('./lib/server')
var log = require('bole')('json-live')

var port = parseInt(process.env.JSON_LIVE_PORT || 12875)

var server = create().listen(port, function(err) {
  if (err) {
    console.error("Error connecting to server:", err)
    process.exit(1)
  }
  log.info('Server running on http://localhost:' + port + '/')
  
  //catch Ctrl + C to close sse server
  var close = server.close.bind(server)
  process.on('SIGINT', close)
})
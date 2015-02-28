#!/usr/bin/env node
require('bole').output({
  level: 'debug',
  stream: process.stdout
})

var create = require('./lib/server')
var argv = require('minimist')(process.argv.slice(2))
var log = require('bole')('json-live')

argv.port = parseInt(process.env.JSON_LIVE_PORT || 12875)

var server = create(argv).listen(argv.port, function(err) {
  if (err) {
    console.error("Error connecting to server:", err)
    process.exit(1)
  }
  log.info('Server running on http://localhost:' + argv.port + '/')

  //catch Ctrl + C to close server
  var close = server.close.bind(server)
  process.on('exit', close)
  process.on('SIGINT', close)
})
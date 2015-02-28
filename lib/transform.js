var replace = require('replace-method')
var esprima = require('esprima')
var through = require('through')
var request = require('request')
var path = require('path')
var qs = require('querystring')
var fs = require('fs')
var port = parseInt(process.env.JSON_LIVE_PORT || 12875)

var isJsonRequire = /[\.\/\\]+.*\.json$/
var EXTENSION = '.json'

module.exports = transform


function transform(file, opts) {
  var dirname = path.dirname(file)
  var buffer = []

  return through(function write(data) {
    buffer.push(data)
  }, function flush() {
    buffer = buffer.join('')
    
    if (path.extname(file) === EXTENSION
        || buffer.indexOf(EXTENSION) === -1) {
      this.queue(buffer)
      this.queue(null)
      return
    }

    try {
      var ast = esprima.parse(buffer)
      var src = replace(ast)

      //the destination as a string to be injected into
      //require(...) source
      var dest = './' + path.relative(dirname, __dirname + '/client.js')
      src.replace(['require'], function(node) {
        if (node.type !== 'CallExpression'
            || node.callee.name !== 'require'
            || node.arguments.length === 0)
          return

        var arg = node.arguments[0]
        var jsonFile

        //only replace requires like './blah.json'
        if (arg.type === 'Literal' && isJsonRequire.test(arg.value)) 
          jsonFile = path.resolve(dirname, arg.value)

        if (!jsonFile) 
          return

        var jsonContents = fs.readFileSync(jsonFile, 'utf8')
        if (!jsonContents) 
          throw new Error('Error reading JSON file '+jsonFile+'\n')

        //Unfortunately we can't just pass along the expression,
        //since watchify et al. will listen to the JSON dependency 
        //and trigger bundle re-loads on filechange. Instead, 
        //we need to inline the data, and then de-dupe
        //it ourselves client side
        try {
          node = jsonNode(jsonContents)
        } catch(e) {
          throw new Error("Error parsing JSON file "+jsonFile+"\n"+e+"\n")
        }

        //We could use async & catch some errors here
        var id = jsonFile
        announce({
          _id: id,
          path: jsonFile
        })

        //replaces source with
        //  require('client')(id, data, port)
        return {
          type: 'CallExpression',
          callee: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'require'
            },
            arguments: [{
              type: 'Literal',
              value: dest
            }]
          },
          arguments: [{
            type: 'Literal',
            value: id
          }, node, {
            type: 'Literal',
            value: port
          }]
        }
      })

      this.queue(src.code())
      this.queue(null)
    } catch (e) {
      //If errors are encountered, just leave
      //it all unchanged
      process.stderr.write(e.toString()+'\n')
      this.queue(buffer)
      this.queue(null)
    }
  })
}

function jsonNode(contents) {
  //perhaps a cleaner way of doing this
  return esprima.parse(
    "x="+contents
  ).body[0].expression.right
}

function announce(data) {
  return request.get('http://localhost:'+port+'/submit?' 
      + qs.stringify({ data: JSON.stringify(data) }), 
      function(err, resp) {
        if (err) {
          if (err.message.indexOf('ECONNREFUSED'))
            console.error('Could not find json-live on port', port)
          console.error(err.stack)
          process.exit(1)
        }
      })
}
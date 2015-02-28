var replace = require('replace-method')
var evaluate = require('static-eval')
var esprima = require('esprima')
var through = require('through')
var request = require('request')
var sleuth = require('sleuth')
var uuid = require('uuid').v4
var path = require('path')
var isJsonRequire = /[\.\/\\]+.*\.json$/
var qs = require('querystring')
var fs = require('fs')
var port = parseInt(process.env.JSON_LIVE_PORT || 12875)

module.exports = transform

function transform(file, opts) {
  var dirname = path.dirname(file)
  var buffer = []

  return through(function write(data) {
    buffer.push(data)
  }, function flush() {
    buffer = buffer.join('')
    
    if (path.extname(file) === '.json'
        || buffer.indexOf('json') === -1) {
      this.queue(buffer)
      this.queue(null)
      return
    }

    try {
      var ast = esprima.parse(buffer)
      var src = replace(ast)

      var dest = './' + path.relative(dirname, __dirname + '/client.js')
      src.replace(['require'], function(node) {
        if (node.type !== 'CallExpression'
            || node.callee.name !== 'require'
            || node.arguments.length === 0)
          return

        var arg = node.arguments[0]
        var jsonFile

        //simple require('./foo.json')
        if (arg.type === 'Literal' && isJsonRequire.test(arg.value)) {
          jsonFile = path.resolve(dirname, arg.value)
        } 
        //expression require(__dirname+'/foo.json')
        //TODO: browserify doesn't even support these yet..
        // else if (arg.type === 'BinaryExpression') {
        //   jsonFile = evaluate(arg, {
        //     __dirname: dirname,
        //     __filename: file
        //   })
        // }

        if (jsonFile) {
          var cd = path.dirname(file)
          var id = jsonFile
          announce({
            _cd: cd,
            _id: id,
            path: jsonFile
          })

          var jsonContents = fs.readFileSync(jsonFile, 'utf8')
          if (!jsonContents) 
            throw new Error('Error reading JSON file '+id+'\n')

          try {
            node = jsonNode(jsonContents)
          } catch(e) {
            throw new Error("Error parsing JSON file "+id+"\n"+e+"\n")
          }

          return {
              type: 'CallExpression'
            , callee: {
                type: 'CallExpression'
              , callee: { type: 'Identifier', name: 'require' }
              , arguments: [{
                  type: 'Literal'
                , value: dest
              }]
            }
            , arguments: [{
                type: 'Literal'
              , value: id
            }, node, {
                type: 'Literal'
              , value: port
            }]
          }
        }      
      })

      this.queue(src.code())
      this.queue(null)
    } catch (e) {
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
      + qs.stringify({ data: JSON.stringify(data) }))
}
var test = require('tape')
var client = require('../client')
var sse = require('sse-stream')
var obj = JSON.stringify({ foo: 'bar', test: 25 })

test('should cache as if require()', function(t) {
    
    var result1 = client('a', JSON.parse(obj))
    var result2 = client('b', JSON.parse(obj))
    var result3 = client('a', JSON.parse(obj))
    var port = 120
    t.notEqual(result1, result2, 'unique IDs should provide the same reference', port)
    t.equal(result1, result3, 'should cache same IDs', port)
    t.end()
})
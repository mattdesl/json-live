var data = require('./simple.json')
// var data2 = require('./package.json')
var path = require('inherits')
var live = require('./')
window.dataB = data

live.on('update', function() {
    console.log("OMG UPDATE!")
})

var fn = function() {
    console.log(data.text)
}

fn()
setInterval(fn, 2000)
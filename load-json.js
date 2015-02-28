//the node version is pretty useless
var fs = require('fs')
module.exports = function(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}
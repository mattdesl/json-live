var dataC = require('../simple.json')
console.log(dataC.position)
window.dataC = dataC

window.printer = function() {
    return dataC.text
}
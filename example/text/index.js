//should reference the same object as in example/index.js
var data = require('../model.json')

module.exports = function(ctx, position) {
  ctx.fillStyle = 'white'
  ctx.fillText(data.text || '', position[0] + 20, position[1] + 20)
}
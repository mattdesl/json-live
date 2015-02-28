require('canvas-testbed')(render)

var position = require('./position.json')
var model = require('./model.json')
var renderText = require('./text')

require('../').on('update', function(obj, id) {
  console.log("Updated", obj, id)
})

var time = 0

function render(ctx, width, height, dt) {
  ctx.clearRect(0, 0, width, height)
  time += dt / 1000
  ctx.fillStyle = (model.style && model.style.background) || 'black'
  ctx.fillRect(position[0], position[1], 50 + (Math.sin(time) / 2 + 0.5) * 50, 100)
  renderText(ctx, position)
}
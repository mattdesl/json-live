require('canvas-testbed')(render)

var data = require('./simple.json')
require('./example')
require('./other/foo')
window.dataA = data

var time = 0
function render(ctx, width, height, dt) {
    ctx.clearRect(0,0,width,height)
    time += dt/1000
    ctx.fillStyle = data.style || 'black'
    ctx.fillRect(data.position[0], data.position[1], 50+(Math.sin(time)/2+0.5)*50, 100)
    ctx.fillStyle = 'white'
    ctx.fillText(data.text||'', data.position[0]+20, data.position[1]+20)
}
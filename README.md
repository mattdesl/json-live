# json-live

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[(demo)](https://www.youtube.com/watch?v=ylV7aqswHYg&feature=youtu.be)

Live-update JSON objects on file change, without destroying application state. This is ideal for animations and rapid UI development.

Say you have some relative require statements like so:

```js
var model = require('./model.json')

setInterval(function() {
    console.log("My name is", model.name)
}, 1000)
```

Where `model.json` might look like this:

```json
{
    "name": "mattdesl",
    "color": "blue"
}
```



## Usage

[![NPM](https://nodei.co/npm/json-live.png)](https://www.npmjs.com/package/json-live)

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/json-live/blob/master/LICENSE.md) for details.

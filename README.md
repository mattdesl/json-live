# json-live

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

[(demo)](https://www.youtube.com/watch?v=ylV7aqswHYg&feature=youtu.be)

Live-update JSON objects on file change, without destroying application state. This is ideal for animations and rapid UI development.

This comes in the form of a server and browserify transform, but requires no frontend code changes. Example:

```js
var data = require('./model.json')

setInterval(function() {
    console.log("My name is", data.name)
}, 1000)
```

With `json-live` running, changing the `model.json` file will update the values of `data` during runtime.

```json
{
    "name": "mattdesl",
    "color": "blue"
}
```

#### Usage

[![NPM](https://nodei.co/npm/json-live.png)](https://www.npmjs.com/package/json-live)

First, install the tool locally:

```sh
npm install json-live --save-dev
```

Include `--transform json-live` as an argument to Browserify.

Now you need to run the server. You can run it directly from shell, like so:  

```sh
./node_modules/.bin/json-live 
```

However, the preferred solution is to add a command to your `package.json` scripts field.

For example, with [wzrd](https://github.com/maxogden/wzrd) your local scripts might look like this. You can optionally use [garnish](https://github.com/mattdesl/garnish) for pretty-printing in the terminal.

```json
"scripts": {
    "server": "json-live | garnish",
    "live": "wzrd index.js:bundle.js -- -t json-live | garnish",
    "build": "browserify index.js | uglifyjs -cm > bundle.js"
}
```

Now, in one process you would `npm run server` to initiate the json-live server. In another process, `npm run live` to initiate the development server. Note the `build` script doesn't include the transform, since it is not needed for production.

You can open `localhost:9966` to see the resulting bundle, and start making changes to JSON files to see them updated during runtime.

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/json-live/blob/master/LICENSE.md) for details.

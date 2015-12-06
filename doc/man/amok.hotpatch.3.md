## NAME

`amok.hotpatch` -- monitor file system and hot patch active scripts.

## SYNOPSIS

```js
function hotpatch();
```

## PARAMETERS

## DESCRIPTION

Creates a middleware function that monitors active script sources and hot
patches their source definitions on file change.

Changes to scripts are only executed at evaluation time, modifications to code
that is not running after load will not have an effect. Changes to code executed
at a later stage, such as callbacks or event handlers can however be changed and
tested on the fly.

## RETURN VALUE

`function(client, runner, done)`

## EXAMPLES

Hot patch scripts with aliases

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.set('scripts', {
  'alias': 'real-path.js':
});

runner.use(amok.hotpatch());
runner.connect(9922, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Hot patching runner scripts');
});
```

Subscribe to script changes in a browser target

```js
window.addEventListener('scriptChange', function(event) {
  console.log('script %s changed', event.detail.filename);
});
```

## SEE ALSO

[amok.watch](amok.watch.3.md)

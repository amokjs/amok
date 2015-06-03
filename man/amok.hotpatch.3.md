# amok.hotpatch -- watch source files and hot patch remote function definitions.
## SYNOPSIS

```js
function hotpatch([glob]);
```

## PARAMETERS
`command` *String*
:   The command to use

`args` *Array*
:   The arguments to use

## DESCRIPTION

Creates a middleware function that watches the values of
`runner.get('scripts')` and the given `glob` for changes, hot patching function
definitions and dispatching `patch` events on the window object when the source
file of an active script changes while the inspector is attached to a target.

If `glob` is not given, it will be ignored.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE

Hot patch scripts set via `runner.set`

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

Hot patch scripts matching a glob pattern

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.hotpatch('**/*.js'));
runner.connect(9922, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Hot patching glob');
});
```

## SEE ALSO

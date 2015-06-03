# amok.watch -- watch files and dispatch events
## SYNOPSIS

```js
function watch(glob)
```

## PARAMETERS
`glob` *String*
:   The glob pattern to watch

## DESCRIPTION

Creates a middleware function that watches files matching the given `glob`,
emitting events on the target window object when files are added, changed or
removed.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE

Watch files

```js
var amok = require('amok');

runner.use(amok.watch('*/**.css'));
runner.connect(4000, 'localhost', function(error, inspector, runner) {
  console.log('Server listening on http://localhost:4000');
});
```

## SEE ALSO

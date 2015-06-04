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

Watch files matching a glob pattern

```js
var amok = require('amok');

runner.use(amok.watch('*/**.css'));
runner.connect(4000, 'localhost', function(error, inspector, runner) {
  console.log('Server listening on http://localhost:4000');
});
```

Listen for watch events in the browser runtime

```js
window.addEventListener('add', function(event) {
  console.log('% added', event.detail.filename);
});

window.addEventListener('change', function(event) {
  console.log('% changed', event.detail.filename);
});

window.addEventListener('unlink', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

## SEE ALSO

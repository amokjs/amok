## NAME

amok.Runner.use -- use a middleware function

## SYNOPSIS

```js
function use(fn);
```

## PARAMETERS
`fn` *function*
:   The middleware to use.

## RETURN VALUE

The `amok.Runner` object.

## DESCRIPTION

Adds the given `fn` to the middleware stack

## EXAMPLES

```js
var runner = require('amok');
var runner = new amok.Runner();

runner.use(function(client, runner, done) {
  done();
});
```

## SEE ALSO

[`amok.Runner`](amok.Runner.3.md)

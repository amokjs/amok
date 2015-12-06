## NAME

amok.serve -- serve static files.

## SYNOPSIS

```js
function serve(port, host)
```

## PARAMETERS
`port` *String*
:   The port number to use

`args` *Array*
:   The hostname to use

## DESCRIPTION

Creates a middleware function that starts a http server listening on the given
`port` and `hostname`.

Use `runner.set('cwd')` to specify the base directory of the server.

If no index.html is present in the base directory, one will generated on the
fly. Use `runner.set('scripts')` to specify scripts for the default index.html
generation.

## RETURN VALUE

An `amok.Runner` middleware function

## EXAMPLE

Use server

```js
var amok = require('amok');

runner.use(amok.serve(4000, 'localhost'));
runner.run(function(error, inspector, runner) {
  console.log('Server listening on http://localhost:4000');
});
```

## SEE ALSO

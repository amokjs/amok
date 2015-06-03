# amok.compiler -- watch and incrementally compile scripts.
## SYNOPSIS

```js
function compiler(compiler, args)
```

## PARAMETERS
`command` *String*
:   The command to run

`args` *Array*
:   List of string arguments

## DESCRIPTION

Creates a middleware function that spawns a compiler process specified with the given
`command` with command line arguments in `args`. If omitted, args defaults to an
empty *Array*.

`command` must be an absolute or relative path to `babel`, `coffee`, `tsc`,
`watchify` or `webpack`.

Use `runner.get('scripts')` to get the input and output files resulting from
the compilation.

The compiler process will be killed when the runner emits a close event.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE

Get compilation result

```js
var amok = require('amok');

runner.use(amok.compiler('babel'));
runner.run(function(error, inspector, runner) {
  var scripts = runner.get('scripts');
  console.dir(scripts);
});
```

## SEE ALSO

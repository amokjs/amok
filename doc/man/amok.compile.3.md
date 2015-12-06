## NAME

`amok.compile` -- watch and incrementally compile scripts.

## SYNOPSIS

```js
compile(compiler, [args], [options])
```

## PARAMETERS

`command` *String*
:   The command to run

`args` *Array*
:   List of string arguments

`output` *stream.Readable*
:   The output stream to use

## DESCRIPTION

 Creates a middleware function that spawns a compiler process specified with
the given `command` with command line arguments in `args`. If omitted, `args`
defaults to an empty *Array*.

## RETURN VALUE

`function(client, runner, done)`

## EXAMPLES

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

[`amok.compiler`](amok.compiler.3.md)

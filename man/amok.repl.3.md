# amok.print -- create a remote read-eval-print-loop
## SYNOPSIS

```js
function repl(input, output)
```

## PARAMETERS
`stream` *stream.Writeable*
:   The stream to use

## DESCRIPTION

Creates a middleware function that starts a read-eval-print-loop taking
input from the given `input` stream and writing to the given `output` stream.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE
Start a read-eval-print-loop

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.repl(process.stdin, process.stdout));
runner.connect(9922, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Starting REPL');
});
```

## SEE ALSO

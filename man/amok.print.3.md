# amok.print -- redirect remote console to stream
## SYNOPSIS

```js
function print(stream)
```

## PARAMETERS
`stream` *stream.Writeable*
:   The stream to use

## DESCRIPTION

Creates a middleware function that redirects the inspector console stream to
the given writeable `stream` while the inspector is attached to a target.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE
Redirect inspector console to stdout

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.print(process.stdout));
runner.connect(9922, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Redirecting remote console to stdout');
});
```

## SEE ALSO

## NAME

`amok.Runner` -- middleware runner

## SYNOPSIS

```js
new Runner()
```

## PROPERTIES

[amok.Runner.prototype](doc/api/Runner.prototype.md)
:   Allows the addition of properties to `amok.Runner` instances.

## EVENTS

`connect`
:   Emitted when the runner connects.

`close`
:   Emitter when the runner closes.

## METHODS

[amok.Runner.prototype.close](doc/api/Runner.prototype.close.md)
:   Closes the runner

[amok.Runner.prototype.connect](doc/api/Runner.prototype.close.md)
:   Runs middleware and connects the a client.

[amok.Runner.prototype.get](doc/api/Runner.prototype.get.md)
:   Returns the value with the given key.

[amok.Runner.prototype.run](doc/api/Runner.prototype.run.md)
:   Runs through the middleware stack.

[amok.Runner.prototype.set](doc/api/Runner.prototype.set.md)
:   Sets a value for the given key.

[amok.Runner.prototype.use](doc/api/Runner.prototype.use.md)
:   Adds a function to the middleware stack.

## DESCRIPTION

An `amok.Runner` objects are middleware runners that encapsulate `rdbg.Client`
objects.

## EXAMPLES

Using the `amok.Runner` object

```js
var amok = require('amok');

var runner = new amok.Runner();
runner.use(function(client, runner, callback) {
  client.on('connect', function() {
    console.log('connect');
  });

  client.on('close', function() {
    console.log('close');
  });

  done();
});

runner.connect(9222, 'localhost');
```

## SEE ALSO

[amok.createRunner](doc/api/createRunner.md)

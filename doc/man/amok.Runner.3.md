## NAME

`amok.Runner` -- middleware runner

## SYNOPSIS

```js
new Runner()
```

## PROPERTIES

[amok.Runner.prototype](amok.Runner.prototype.3.md)
:   Allows the addition of properties to `amok.Runner` instances.

## EVENTS

`connect`
:   Emitted when the runner connects.

`close`
:   Emitter when the runner closes.

## METHODS

[amok.Runner.prototype.close](amok.Runner.prototype.close.3.md)
:   Closes the runner

[amok.Runner.prototype.connect](amok.Runner.prototype.close.3.md)
:   Runs middleware and connects the a client.

[amok.Runner.prototype.get](amok.Runner.prototype.get.3.md)
:   Returns the value with the given key.

[amok.Runner.prototype.run](amok.Runner.prototype.run.3.md)
:   Runs through the middleware stack.

[amok.Runner.prototype.set](amok.Runner.prototype.set.3.md)
:   Sets a value for the given key.

[amok.Runner.prototype.use](amok.Runner.prototype.use.3.md)
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

[amok.createRunner](amok.createRunner.3.md)

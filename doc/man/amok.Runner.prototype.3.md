## NAME

`amok.Runner.prototype` -- prototype for the `amok.Runner` constructor.

## PROPERTIES

`amok.Runner.prototype.constructor`(amok.Runner.prototype.3.md)
:   Specifies the function that creates an object's prototype.

## METHODS

[`amok.Runner.prototype.close`](amok.Runner.prototype.close.3.md)
:   Closes the runner

[`amok.Runner.prototype.connect`](amok.Runner.prototype.close.3.md)
:   Runs middleware and connects the a client.

[`amok.Runner.prototype.get`](amok.Runner.prototype.get.3.md)
:   Returns the value with the given key.

[`amok.Runner.prototype.run`](amok.Runner.prototype.run.3.md)
:   Runs through the middleware stack.

[`amok.Runner.prototype.set`](amok.Runner.prototype.set.3.md)
:   Sets a value for the given key.

[`amok.Runner.prototype.use`](amok.Runner.prototype.use.3.md)
:   Adds a function to the middleware stack.

## DESCRIPTION

`amok.Runner` instances inherit from `amok.Runner.prototype`. You can use the
constructor's prototype object to add properties or methods to all `amok.Runner`
instances.

## SEE ALSO

[`amok.createRunner`](amok.createRunner.3.md)

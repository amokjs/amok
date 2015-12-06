## NAME

`amok.createRunner` -- creates a new instance of amok.Runner

## SYNOPSIS

```js
createRunner()
```

## DESCRIPTION

Creates a new `amok.Runner` object, this is equivalent of calling the
constructor [`amok.Runner`](amok.Runner.3.md) constructor.

## RETURN VALUE

An `amok.Runner` object.

## EXAMPLES

Create a `amok.Runner` object

```js
var amok = require('amok');

amok.createRunner()
  .set('directory', process.cwd())
  .use(function(client, runner, done) {
    console.log(runner.get('directory'));
  })
  .connect('localhost', 9222, function() {
    console.log('connected');
  });
```

## SEE ALSO

[`amok.Runner`](amok.Runner.3.md)

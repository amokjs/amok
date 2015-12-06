## NAME

amok.Runner.run -- run through the middleware stack

## SYNOPSIS

```js
function run(callback)
```

## PARAMETERS
`callback` *function(error, inspector, runner)*
:   The callback to use.

## RETURN VALUE

The `amok.Runner` object.

## DESCRIPTION

Runs through the middleware stack, calling the `callback` function when done.

## SEE ALSO

[`amok.Runner`](amok.Runner.3.md)

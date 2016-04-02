## NAME

amok -- browser development workflow framework

## SYNOPSIS

```js
require('amok')
```

## METHODS

[`amok.Runner`](doc/api/Runner.md)
:   Runner

[`amok.createRunner`](doc/api/createRunner.md)
:   Creates an `amok.Runner` object.

[`amok.browse`](doc/api/browse.md)
:   Middleware for opening a browser.

[`amok.compile`](doc/api/compile.md)
:   Middleware for watching and incrementally preprocessing scripts with a compiler.

[`amok.hotpatch`](doc/api/hotpatch.md)
:   Middleware for monitoring script sources and hot patching active scripts.

[`amok.print`](doc/api/print.md)
:   Middleware for redirecting the client's console to a readable stream.

[`amok.interact`](doc/api/interact.md)
:   Middleware for creating a read-eval-print-loop.

[`amok.serve`](doc/api/serve.md)
:   Middleware for starting a http development server.

[`amok.watch`](doc/api/watch.md)
:   Middleware for monitoring files matching a pattern.

## DESCRIPTION

Use `require('amok') to use this module.

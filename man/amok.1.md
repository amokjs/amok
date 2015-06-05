# amok -- hot code patching, testing and debugging for browsers
## SYNOPSIS

| **amok** [OPTION ...] _URL_
| **amok** [OPTION ...] _FILE_ [-- COMPILER OPTION ...]

## DESCRIPTION

**Amok** is a debugging tool that enables editor agnostic hot code patching,
testing and debugging for browsers through a remote connection.

 With a _url_, **amok** will connect to a tab with the given _url_, the
`--browser` option may be used in order to open the _url_ in a new browser
process.

With a _file_ **amok** will start a http server and connect to a browser tab
with the address of the server, the `--cwd`, `--port` and `--host` host options
dictate the root directory and address of the server. If no index.html file is
present one will be generated with the input files referenced as scripts in the
body of the document.

The `--compiler` option may be used in order to enable incremental preprocessing
with a compiler, which will shadow the path of the input _file_.

Output from the browser's console is redirected to standard output.
The `--debug-port` and `--debug-host` options define the address where the
remote debugging connection will be established.

The `--hot`, `--watch` and `--interactive` options enable hot code patching,
file system monitoring and an interactive read-eval-print-loop.

## OPTIONS

`--debug-port` _PORT_
:   The port number where the remote debugging connection will be established,
by default this will be on port `9222`.

`--debug-host` _PORT_
:   The host name where the remote debugging connection will be established,
by default this will be `localhost`.

`-b`, `--browser` _BROWSER_
:   Open the input or server url in the specified browser which must be either
`chrome` or `chromium`. The `CHROME_BIN` and `CHROMIUM_BIN` environment
variables specify the the location of   the executable, if left undefined amok
will search in `PATH` and the default installation path of the browser for the
executable.

The `CHROME_FLAGS` and `CHROMIUM_FLAGS` can be used to specify a list of comma
separated arguments to use when spawning the browser process.

`-c`, `--cwd` _DIR_
:   Change the working directory to the specified directory, this directory
serves as the root from which the http server serves its files from;

`-w`, `--watch` _GLOB_
:   Enables monitoring of the given glob pattern in the file system,
dispatching events on the window object

`-t`, `--hot` _GLOB_
:   Enables monitoring of input files and if specified the given glob pattern,
hot patching functions without interrupting execution on file change.

`--http-port` _PORT_
:   The port number where the http server will listen on when serving input *files*,
by default this will be `9966`.

`--http-host` _HOST_
:   The hostname where the http server will be listening on when serving input *files*,
by default this will be `localhost`.

`-i`, `--interactive`
:   Starts **amok** in a read-eval-print-loop.

`-v`, `--verbose`
:   Enables verbose output mode.

`-h`, `--help`
:   Print **amok** usage information and exit.

`-V`, `--version`
:   Print **amok** version information and exit.

## BROWSER EVENTS

The `--watch` option enables several events on the window object which are
dispatched when a file is added, changed or removed.

```js
addEventListener('add', function(event) {
  console.log('%s added', event.detail.filename);
});

addEventListener('change', function(event) {
  console.log('%s changed', event.detail.filename);
});

addEventListener('unlink', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

The `--hot` option also enables an event on the window object which is
dispatched after a hot code patch has been applied successfully.

```
addEventListener('patch', function(event) {
  console.log('%s patched', event.detail.filename);
  console.log('event.detail.source);
});
```

## ENVIRONMENT

* `CHROME_BIN`
:   The full path to a `Chromium` executable to use when opening a `chromium`
    browser with the `--browser` option.

* `CHROME_FLAGS`
:   List of comma separated command line flags to use then opening `Google Chrome` with the `--browser` option.

* `CHROMIUM_BIN`
:   The full path to a `Chromium` executable to use when using the `chromium`
    browser with the `--browser` option.

* `CHROMIUM_FLAGS`
:   List of comma separated command line flags to use then opening `chromium` with the `--browser` option.

## EXAMPLES

Open chrome with a local file system URL

```sh
$ amok --browser chrome file://index.html
```

Open chrome with an external server URL

```sh
$ amok --browser chrome http://localhost:4000
```

Open chrome with a server and compiler

```sh
$ amok --browser chrome --compiler watchify lib/index.js
```

## BUGS

`Google Chrome` and `Chromium Browser` only allow a single client connection at any
given time, and the `Chrome Developer Tools` count towards that limit and has
priority access so inspecting the page in the browser will cause **amok** to
disconnect, for more information see <http://crbug.com/129539>

## COPYRIGHT

Copyright (C) 2015 Casper Beyer <http://caspervonb.com>

## SEE ALSO

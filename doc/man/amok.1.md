## NAME

`amok` -- development workflow tool for browsers

## SYNOPSIS

`amok` [*OPTION* ...] _URL_  
`amok` [*OPTION* ...] _FILE_... [`--` *COMPILER OPTION* ...]  

## DESCRIPTION

**Amok** facilitates incremental development and live code editing for browsers
with hot code patching, quick server and browser launching, preprocessing
support, console mirroring and a read-eval-print-loop.

With a _URL_, **amok** will connect to a browser page with the given _url_, the
`--browser` option may be used in order to open the _url_ in a browser before
connecting to it.

With one or more _FILES_ **amok** will start a http server before connecting to
a browser page with the given _url_, the `--cwd`, `--port` and `--host` host
options dictate the root directory, port and address of the server. If no
index.html file is present, the server will be generate one on demand, with the
input files referenced as script elements in the body of the document.

The `--browser` option may be used in order to open the server's url in a
browser before attempting to establish a connection to it.

The `--compiler` option may be used in order to enable incremental preprocessing
with a compiler, which will shadow the path of the input _file_.

While a connection is established, console output from the browser will be
mirrored in standard output.

The `--debug-port` and `--debug-host` options define the address where the
outbound remote debugging connection will be established.

The `--hot`, `--watch` and `--interactive` options enable hot code patching,
file system monitoring and an interactive read-eval-print-loop.

## OPTIONS

`--debug-port` _PORT_
:   The port number where the remote debugging connection will be established,
by default this will be on port `9223`.

`--debug-host` _PORT_
:   The host name where the remote debugging connection will be established,
by default this will be `localhost`.

`-b`, `--browser` _BROWSER_
:   Opens the target url in a new browser process, the browser process will be started with a new unique profile and listen for debug connections on `--debug-port`

`-c`, `--cwd` _DIR_
:   Change the working directory to the specified directory.

`-w`, `--watch` _GLOB_
:   Enables monitoring of the file system, if a glob pattern is specified only files matching the pattern will be watched,
otherwise all files in the working directory will be monitored.

`-t`, `--hot`
:   Enables monitoring of source files and hot patching of active scripts.
Changes to scripts are only executed at evaluation time, meaning that modifications to code that is not running after load will not have an effect.
Changes to code executed at a later stage, such as callback handlers can however be changed and tested on the fly.

`--http-port` _PORT_
:   The port number where the http server will listen on when serving input *files*,
by default this will be `9966`.

`--http-host` _HOST_
:   The hostname where the http server will be listening on when serving input *files*,
by default this will be `localhost`.

`-i`, `--interactive`
:   Starts **amok** in a read-eval-print-loop.

`-h`, `--help`
:   Print **amok** usage information and exit.

`-V`, `--version`
:   Print **amok** version information and exit.

## EVENTS

The `--watch` option enables several events on the window object which are
dispatched when a file is added, changed or removed.

```js
addEventListener('fileCreate', function(event) {
  console.log('%s added', event.detail.filename);
});

addEventListener('fileChange', function(event) {
  console.log('%s changed', event.detail.filename);
});

addEventListener('fileRemove', function(event) {
  console.log('%s removed', event.detail.filename);
});
```

The `--hot` option also enables an event on the window object which is
dispatched after a hot code patch has been applied successfully.

```js
window.addEventListener('scriptChange', function(event) {
  console.log('script \'%s\' changed', event.detail.filename);
});
```

## ENVIRONMENT

* `BROWSER`
:   Path to the default browser executable to use when no browser name or
executable path is given to the _BROWSER_ option.

* `BROWSER_FLAGS`
:   List of command line options used when spawning a browser.

## EXAMPLES

Connect to an existing browser page with a matching url

```sh
$ amok http://localhost:4000
```

Open chrome with a local file system URL

```sh
$ amok --browser chrome file://absolute/path/to/index.html
```

Open chrome with an external url

```sh
$ amok --browser chrome http://localhost:4000
```

Open chrome with a server using watchify as the compiler

```sh
$ amok --browser chrome --compiler watchify index.js
```

## BUGS

Chrome based browsers only allow a single socket connection at a time,
the embedded developer tools will forcefully grab the socket when
the developer tools are opened and disconnect any external clients, including **amok**.
Closing developer tools will let **amok** reconnect.
For more information on the issue see <http://crbug.com/129539>

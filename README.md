# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

## Synopsis
```sh
amok [options] <script>
```

## Description
Amok standalone command line tool for rapid prototyping and development of JavaScript applications.

It monitors changes in the file system. As soon as you save a file, it is then preprocessed, compiled and bundled as needed, and re-compiled in the client session without refreshing or restarting the client.

This re-compilation is done through a debugging session, unlike reloading or reevaluation, re-compilation leaves the application state intact, no side effects are executed when doing re-compilation.

Additional features include a zero configuration http development server for developing front end applications, an interactive mode (read–eval–print loop).

## Example
### Setting Chrome as the Client
First, set `AMOK_CLIENT` to the path of the chrome executable, the
appropriate value depends on your operating system.

This could also be set by passing it via the `--client` option.

#### Linux
```sh
export AMOK_CLIENT='google-chrome --remote-debugging-port=9222'
```

#### OSX
```sh
export AMOK_CLIENT='"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome" --remote-debugging-port=9222'
```

#### Windows 7 (32 bit)
```sh
SET AMOK_CLIENT='"C:\Program Files\Google\Application\chrome.exe" --remote-debugging-port=9222'
```
#### Windows 7 (64 bit)
```sh
SET AMOK_CLIENT='"C:\Program Files\Google\Application\chrome.exe" --remote-debugging-port=9222'
```

### Launching with a Compiler
To lanch with a compiler, we'll set the --compiler option (default can be set via the `AMOK_COMPILER` environment variable)

### Browserify
```sh
amok --compiler 'watchify -o $@' entry.js
```

### Webpack
```sh
amok --compiler 'webpack --watch --output-file $@' entry.js
```

## Options
```
-h, --host <HOST>
  specify the http host, default HOST is localhost.

-p, --port <PORT>
  specify the http port, default PORT is 9966.

-H, --debugger-host <HOST>
  specify the remote debugger host, default HOST is localhost.

-P, --debugger-port <PORT>
  specify the remote debugger port, default PORT is 9222.

--client
  specify the client to spawn

--compiler
  specify the compiler to spawn

-v, --verbose
  enable verbose logging mode

--no-client
  disable client

--no-compiler
  disable compiler
```

Amok requires that a client is listening on the remote debugging port when launching, it can spawn a client for you at the appropriate time, this is set by passing the `--client` option with the executable name and appropriate flags, this option has automatic variables available to it.

Amok can also, optionally use a compiler to process script sources, this compiler is specified via the `--compiler` option, this option has automatic variables available to it.

Any extra arguments following the `--` terminator, will be passed as arguments when spawning the compiler, if one is specified.

## Environment Variables
These environment variables are used to provide amok with default values.

```
AMOK_CLIENT
  When set to a executable, will be used as the default client value.

AMOK_COMPILER
  When set to an executable, will be used as the default compiler value.
```

## Automatic Variables
These automatic variables are set and substituted when spawning clients and compilers.

```
$@
  When using a compiler, this is set to the output path of the compilation result
```

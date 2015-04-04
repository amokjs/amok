# Amok(1)
[![tips](https://img.shields.io/gratipay/caspervonb.svg?style=flat-square)](https://gratipay.com/caspervonb/)
[![chat](https://img.shields.io/badge/gitter-join%20chat-green.svg?style=flat-square)](https://gitter.im/caspervonb/amok)
[![npm](https://img.shields.io/npm/v/amok.svg?style=flat-square)](https://www.npmjs.org/package/amok)

## Synopsis
```sh
amok [options] <script>
```

## Installation
```
npm install amok -g
```

## Description
Amok standalone command line tool for rapid prototyping and development of JavaScript applications.

It monitors changes in the file system. As soon as you save a file, it is then preprocessed, compiled and bundled as needed, and re-compiled in the client session without refreshing or restarting the client.

This re-compilation is done through a debugging session, unlike reloading or reevaluation, re-compilation leaves the application state intact, no side effects are executed when doing re-compilation.

Additional features include a zero configuration http development server for developing front end applications, an interactive mode (read–eval–print loop) and console redirection.

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

--client <identifier>
  specify the client to spawn

--compiler <identifier>
  specify the compiler to spawn
  
--css <FILE(S)>
  comma-separated list of css files to preload
  
--js <FILE(S)>
  comma-separated list of JS files to preload
  
--head
  inject preloaded JS into <head> (default)
  
--body
  inject preloaded JS into <body>
  
--div
  inject a <div> with id="main" into <body>
  
-i, --interactive
  start in interactive mode

-v, --verbose
  enable verbose logging mode
```

You must have a client already listening on the remote debugging port when launching, or specified via the `--client` option.

Optionally a compiler may be specified to process script sources via the `--compiler` option,
Any extra arguments and options following the option parsing terminator `--`, will be passed as extra options to the compiler. The specified compiler must have its executable available in `PATH`.

## Example
1. `git clone https://gist.github.com/d58c3eecb72ba3dd0846.git examples`
2. `cd examples`
3. `amok --client chrome canvas.js`

### Webpack
`amok --client chrome --compiler webpack canvas.js`

### Browserify
`amok --client chrome --compiler browserify canvas.js`

### Babel
`amok --client chrome --compiler babel canvas.js`

### TypeScript
`amok --client chrome --compiler typescript canvas.js`

### CoffeeScript
`amok --client chrome --compiler coffeescript canvas.js`

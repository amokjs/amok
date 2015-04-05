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

It monitors changes in the file system. As soon as you save a file, it is then preprocessed, compiled and bundled as needed, the code is then refreshed in the client while it is running without restarting or reloading the client.

This re-compilation is done through a remote debugging session, which leverages the re-compilation capabilities built into the runtime itself. Doing re-compilation has several advantages over reloading and hot replacement, application state is kept, no side effects are executed, and there is no code that cannot be edited live.

It also has a zero configuration http development server for developing front end applications, this server will automatically generate an appropriate *index.html* file if one is not found.

Additional features include an interactive mode (read–eval–print loop) and console redirection.

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
  
-i, --interactive
  start in interactive mode

-v, --verbose
  enable verbose logging mode
```

You must have a client already listening on the remote debugging port when launching, or specified via the **client** option.

Optionally a compiler may be specified to process script sources via the **compiler** option,
Any extra arguments and options following the option parsing terminator **--**, will be passed as extra options to the compiler. The specified compiler must have its executable available via **PATH**.

## Example
1. `git clone https://gist.github.com/d58c3eecb72ba3dd0846.git examples`
2. `cd examples`
3. `amok --client chrome canvas.js`

### Webpack
```sh
amok --client chrome --compiler webpack canvas.js
```

### Browserify
```sh
amok --client chrome --compiler browserify canvas.js
```

### Babel
```sh
amok --client chrome --compiler babel canvas.js
```

### TypeScript
```sh
amok --client chrome --compiler typescript canvas.ts
```

### CoffeeScript
```sh
amok --client chrome --compiler coffeescript canvas.coffee
```

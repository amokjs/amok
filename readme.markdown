# Amok(1)

[![Join the chat at https://gitter.im/caspervonb/amok](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/caspervonb/amok?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Dependency Status](https://img.shields.io/gratipay/caspervonb.svg)](https://gratipay.com/caspervonb/)
[![Dependency Status](https://img.shields.io/badge/gitter-join%20chat-green.svg)](https://gitter.im/caspervonb/amok)

[![Live Editing JavaScript with Amok](http://img.youtube.com/vi/xHXqyfkct2w/0.jpg)](http://www.youtube.com/watch?v=xHXqyfkct2w)
## Synopsis
```
amok [options] <script>
```

## Description
Amok is a command line tool for rapid prototyping and development of applications
written in JavaScript targeting the browser.

Edit your code live with realtime feedback, without having to reload the client
or loose the application state.

```
export BROWSER="google-chrome --remote-debugging-port=9222"
export BUNDLER="watchify"
  
amok myapp.js
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
    
--no-browser
  disable browser spawning
    
--no-bundler
  disable bundling

--no-debugger
  disable remote debugger
```

Any extra arguments will be passed along with the invocation to BUNDLER.

## Environment Variables
```
BROWSER
  When set to a executable, will be opened after the server has started.

BUNDLER
  When set to an executable, will be used to bundle scripts.
```

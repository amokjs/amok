## NAME

amok.browse -- spawn a local browser process

## SYNOPSIS

```js
browser(port, command, [args], [options])
```

## PARAMETERS

`port` *Integer*
:   The port to listen on

`command` *String*
:   The command to run

`args` *Array*
:   List of string arguments

`options` *Object*
:   The options to use

## DESCRIPTION

Creates a middleware function that spawns a browser process specified with the
given `command` with command line arguments in `args`. If omitted, `args`
defaults to an empty *Array*.

The browser will accept debug connections on the port specified by the given
`port`.

## RETURN VALUE

`function(client, runner, done)`

## EXAMPLES

Open and connect to chrome

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.browser('chrome'));
runner.connect(9222, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Spawned and connected to chrome');
});
```

Open and connect to chrome using an absolute executable path

```js
var amok = require('amok');

var runner = amok.createRunner();
runner.use(amok.browser('/usr/bin/opt/chrome/google-chrome'));
runner.connect(9222, 'localhost', function(error) {
  if (error) {
    return console.error(error);
  }

  console.log('Spawned and connected to chrome');
});
```

## SEE ALSO

[amok.Runner.prototype.use](amok.Runner.prototype.use.3.md)

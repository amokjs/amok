# amok.browser -- spawn a local browser process
## SYNOPSIS

```js
function browser(command, [args])
```

## PARAMETERS

`command` *String*
:   The command to run

`args` *Array*
:   List of string arguments

## DESCRIPTION

Creates a middleware function that spawns a browser process specified with the
given `command` with command line arguments in `args`. If omitted, args defaults
to an empty *Array*.

`command` may be an absolute path to a chrome or chromium executable or the type
of a browser (`chrome` or `chromium`) in which case `PATH` and the default known
vendor directories will be used in order to search for the appropriate
executable.

Use `runner.set('url', value)` to specify the url which the browser should open.

The browser process will be killed when the runner emits a close event.

## RETURN VALUE

`function(inspector, runner, done)`

## EXAMPLE

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

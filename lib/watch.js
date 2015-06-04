const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-watch');

function plugin(glob) {
  debug('hotpatch %s', glob);

  return function hotpatch(inspector, runner, done) {
    var files = runner.get('scripts');

    debug('watch %s', glob);

    var watcher = chokidar.watch(glob, {
      ignoreInitial: true,
      cwd: runner.get('cwd'),
    });

    watcher.once('error', function bail(error) {
      debug('bail %s', error.description);
      done(error);
    });

    watcher.once('ready', function ready() {
      debug('ready');
      done();
    });

    runner.once('close', function close() {
      debug('close');
      watcher.close();
    });

    var events = ['add', 'change',  'unlink'];
    events.forEach(function(event) {
      watcher.on(event, function emit(filename) {
        debug('%s %s', event, filename);

        var detail = JSON.stringify({
          detail: {
            filename: url.resolve('/', filename).slice(1)
          }
        });

        var expr = "var e = new CustomEvent('" + event + "'," +
          detail + ");\nwindow.dispatchEvent(e);";

        inspector.evaluate(expr, function(error) {
          if (error) {
            debug('error %s', error.description);
          }
        });
      });
    });
  };
}

module.exports = plugin;

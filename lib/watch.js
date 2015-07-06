var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');

var debug = util.debuglog('amok-watch');

function plugin(pattern, ignore) {
  return function watch(client, runner, done) {
    var watchers = {};
    var stats = {};
    var pending = {};

    client.on('close', function () {
      debug('client close');

      Object.keys(watchers).forEach(function (key) {
        if (watchers[key]) {
          debug('close watcher %s', key);
          watchers[key].close();
        }
      });

      watchers = {};
      pending = {};
    });

    client.on('connect', function () {
      debug('connect');

      var cwd = runner.get('cwd') || process.cwd();

      setTimeout(function watch(dirname) {
        fs.readdir(dirname, function dir(error, files) {

          files.forEach(function (file) {
            var filename = path.resolve(dirname, file);

            fs.stat(filename, function (error, stat) {
              if (error) {
                return;
              }

              stats[filename] = stat;

              if (stat.isDirectory()) {
                setTimeout(watch, 0, filename);
              }
            });
          });
        });

        debug('create watcher %s', dirname);
        var watcher = fs.watch(dirname);
        watchers[dirname] = watcher;

        watcher.on('error', function (error) {
          debug('watch error %s', error);
          return client.emit('error', error);
        });

        watcher.on('change', function (event, filename) {
          filename = path.resolve(dirname, filename);

          if (pending[filename]) {
            clearTimeout(pending[filename]);
          }

          pending[filename] = setTimeout(function () {
            fs.stat(filename, function (error, stat) {
              if (stats[filename]) {
                if (error) {
                  event = 'unlink';

                  if (watchers[filename]) {
                    watchers[filename].close();
                    watchers[filename] = null;
                  }
                } else {
                  event = 'change';
                }
              } else if (stat) {
                event = 'add';

                if (stat.isDirectory()) {
                  setTimeout(watch, 0, filename);
                }
              }

              stats[filename] = stat;

              var pathname = path.relative(cwd, filename);
              var detail = JSON.stringify({
                detail: {
                  filename: url.resolve('/', pathname).slice(1)
                }
              });

              var cmd = 'var event = new CustomEvent(\'' + event + '\',' +
                detail + ');\nwindow.dispatchEvent(event);';

              client.runtime.evaluate(cmd, function (error, result) {
                if (error) {
                  debug('evaluate error %s', error.description);
                  return client.emit('error', error);
                }
              });
            });
          });
        });
      }, 0, cwd);

      client.runtime.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('runtime');
      });
    });

    debug('done');
    done();
  };
}

module.exports = plugin;

var fs = require('fs');
var util = require('util');
var fs = require('fs');
var url = require('url');
var path = require('path');

var debug = util.debuglog('amok-hotpatch');

function plugin() {
  return function hotpatch(client, runner, done) {
    var pending = {};
    var watchers = {};
    var scripts = {};

    client.on('close', function () {
      debug('client close');
      Object.keys(watchers).forEach(function (key) {
        debug('close watcher %s', key);
        watchers[key].close();
      });

      pending = {};
      watchers = {};
      scripts = {};
    });

    client.on('connect', function () {
      debug('client connect');

      var cwd = runner.get('cwd');
      if (typeof cwd === 'undefined') {
        cwd = process.cwd();
      }

      var sources = runner.get('scripts');
      if (typeof sources === 'undefined') {
        sources = {};
      }

      client.debugger.on('clear', function () {
        debug('debugger clear');
        scripts = {};
      });

      client.debugger.on('scriptParse', function (script) {
        if (!script.url) {
          return;
        }

        var uri = url.parse(script.url);
        var filename = null;

        if (uri.protocol === 'file:') {
          filename = path.normalize(uri.pathname);
          if (filename.match(/^\\[a-zA-Z]:\\/)) {
            filename = filename.slice(1);
          }
        } else if (uri.protocol === 'http:') {
          filename = uri.pathname.slice(1);
          if (sources[path.normalize(filename)]) {
            filename = path.resolve(sources[path.normalize(filename)]);
          } else {
            filename = path.resolve(cwd, filename);
          }
        }

        scripts[filename] = script;
        debug('script parse %s', util.inspect(script));
        
        var dirname = path.dirname(filename);
        if (watchers[dirname]) {
          return;
        }

        debug('create watcher %s', dirname);
        var watcher = fs.watch(dirname);

        watchers[dirname] = watcher;
        watcher.on('error', function (error) {
          debug('watch error %s', error.message);
          client.error('error', error);
        });

        watcher.on('change', function (event, filename) {
          filename = path.resolve(dirname, filename || '');
          debug('%s %s', event, filename);

          var script = scripts[filename];
          if (!script) {
            return debug('skip %s', filename);
          }

          if (pending[filename]) {
            clearTimeout(pending[filename]);
          }

          pending[filename] = setTimeout(function read() {
            pending[filename] = false;
            fs.readFile(filename, 'utf-8', function (error, source) {
              if (error) {
                debug('read error %s', error.message);
                return client.emit('error', error);
              }

              if (source.length === 0) {
                pending[filename] = setTimeout(read, 1000);
                return;
              }

              debug('patch script %s (%d bytes) ', script.url, source.length);
              client.debugger.setScriptSource(script, source, function (error, result) {
                if (error) {
                  debug('set source error %s', util.inspect(error));
                  return client.emit('error', error);
                }

                var detail = JSON.stringify({
                  detail: {
                    filename: path.relative(cwd, filename),
                    source: source,
                  }
                });

                var cmd = 'var event = new CustomEvent(\'patch\',' +
                  detail + ');\nwindow.dispatchEvent(event);';

                debug('evaluate patch event');
                client.runtime.evaluate(cmd, function (error) {
                  if (error) {
                    debug('evaluate error %s', util.inspect(error));
                    return client.emit('error', error);
                  }
                });
              });
            });
          });
        });
      });

      client.debugger.enable(function (error) {
        if (error) {
          return client.emit('error', error);
        }

        debug('debugger');
      });

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

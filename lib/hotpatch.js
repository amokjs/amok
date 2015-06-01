const chokidar = require('chokidar');
const util = require('util');
const fs = require('fs');
const url = require('url');
const path = require('path');

const debug = util.debuglog('amok-hotpatch');

function plugin(glob, options) {
  if (typeof options === 'undefined') {
    options = {};
  }

  return function hotpatch(inspector, runner, done) {
    var files = runner.get('scripts');
    var dirnames = Object.keys(files).map(function(src) {
      return path.dirname(files[src]);
    });

    if (typeof glob === 'string') {
      dirnames.push(glob);
    }

    debug('watch directories %s', dirnames.join(' '));
    var watcher = chokidar.watch(dirnames);

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

    watcher.on('change', function patch(filename) {
      debug('file change %s', filename);

      var sources = runner.get('scripts');

      var ignore = Object.keys(sources).some(function(key) {
        return path.resolve(key) === path.resolve(filename);
      });

      if (ignore) {
        debug('ignore file %s', filename);
        return false;
      }

      var pathname = Object.keys(sources).filter(function(key) {
        return path.resolve(sources[key]) === path.resolve(filename);
      })[0] || path.relative(runner.get('cwd'), filename);

      pathname = path.join('/', pathname);

      inspector.getScripts(function(scripts) {
        debug('find script %s', pathname);

        var script = scripts.filter(function(script) {
          if (!script.url) {
            return;
          }

          var uri = url.parse(script.url);

          if (uri.protocol.match(/^(file)/)) {
            return path.resolve(uri.pathname) === path.resolve(filename);
          }

          if (uri.protocol.match(/^(http)/)) {
            return path.normalize(uri.pathname) === path.normalize(pathname);
          }
        })[0];

        if (!script) {
          return;
        }

        setTimeout(function() {
          debug('read file %s', filename);

          fs.readFile(filename, 'utf-8', function(error, source) {
            if (error) {
              // TODO
            }

            debug('patch script %s - %d bytes', script.url, source.length);

            inspector.setScriptSource(script, source, function(error, result) {
              if (error) {
                return;
              }

              var detail = JSON.stringify({
                detail: {
                  filename: path.relative('/', pathname),
                  source: source,
                }
              });

              var expr = "var e = new CustomEvent('patch'," +
                detail + ");\nwindow.dispatchEvent(e);";

              inspector.evaluate(expr, function() {
              });
            });
          });
        }, 25);
      });
    });
  };
}

module.exports = plugin;

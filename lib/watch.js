var chokidar = require('chokidar');
var extend = require('extend');
var fs = require('fs');
var path = require('path');
var url = require('url');

function watch(connection, glob, options, callback) {
  options = extend({}, {
    scripts: { },
    cwd: process.cwd(),
  }, options);

  if (typeof glob !== 'array') {
    glob = [glob];
  }

  var dirnames = Object.keys(options.scripts).map(function(filename) {
    return path.dirname(filename);
  });

  glob = glob.concat(dirnames);

  var watcher = chokidar.watch(glob, {
    persistent: true,
    ignored: /[\/\\]\./
  });

  var resolve = function(filename) {
    if (options.scripts[filename]) {
      return options.scripts[filename];
    }

    return path.relative(options.cwd, filename);
  };

  var emit = function(event, filename) {
    var source = 'if (typeof(window) !== \'undefined\') {'
               + '  var e = new CustomEvent(\'' + event + '\','
               + '    { detail: \'' + filename + '\' });'
               + '  window.dispatchEvent(e);'
               + '}';
               + 'if (typeof(process) !== \'undefined\') {'
               + '  process.emit(\'' + event + '\', \'' + filename + '\');'
               + '}';

    connection.evaluate(source, function(error, result) {
      if (error) {
        connection.emit('error', error);
      }
    });
  };

  watcher.on('add', function(filename) {
    var pathname = resolve(filename);
    emit('add', pathname);
  });

  watcher.on('remove', function(filename) {
    var pathname = resolve(filename);
    emit('remove', pathname);
  });

  watcher.on('change', function(filename) {
    var pathname = resolve(filename);
    emit('change', pathname);

    setTimeout(function() {
      connection.scripts(function(scripts) {
        var script = scripts.filter(function(script) {
          var location = url.parse(script.url);
          return path.relative('/', location.path || '') === pathname;
        })[0];

        if (script === undefined) {
          return;
        }

        fs.readFile(filename, 'utf-8', function(error, contents) {
          if (error) {
            return watcher.emit('error', error);
          }

          connection.source(script, contents);
        });
      });
    }, 100);
  });

  connection.on('source', function(script) {
    var location = url.parse(script.url);
    var pathname = path.relative('/', location.pathname || '');
    emit('source', pathname);
  });

  watcher.on('error', callback);
  watcher.on('ready', function() {
    watcher.removeListener('error', callback);
    callback(null, watcher);
  });
}

module.exports = watch;

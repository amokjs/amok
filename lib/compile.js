var path = require('path');
var temp = require('temp');
var child = require('child_process');
var which = require('which');
var fs = require('fs');
var mkdirp = require('mkdirp');

function compile(name, args, options) {
  args = args.slice();

  var dirpath = temp.mkdirSync('scripts');
  var pathname = args[0].replace(/\.[^\.]+$/, '.js');

  var filename = path.join(dirpath, pathname);
  var dirname = path.dirname(filename);
  mkdirp.sync(dirname);

  var scripts = {};
  scripts[filename] = pathname;

  switch (name) {
    case 'browserify':
      command = which.sync('watchify');
      args = [
        '-o',
        filename
      ];
      break;

    case 'webpack':
      command = which.sync('webpack');
      args = [
        '--watch',
        '--output-file',
        filename
      ];
      break;

    case 'typescript':
      command = which.sync('tsc');
      args = [
        '--watch',
        '--out',
        filename
      ];
      break;

    case 'coffeescript':
      command = which.sync('coffee');
      args = [
        '--watch',
        '--compile',
        '--output',
        dirpath
      ];
      break;

    case 'babel':
      command = which.sync('babel');
      args = [
        '--watch',
        '--out-file',
        filename
      ];
      break;
  }

  var compiler = child.spawn(command, args);

  process.nextTick(function tick() {
    fs.exists(filename, function(exists) {
      if (exists) {
        compiler.emit('ready', scripts);
      } else {
        setTimeout(tick, 100);
      }
    });
  });

  return compiler;
}

module.exports = compile;

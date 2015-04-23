var async = require('async');
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
      args.unshift(
        '--outfile',
        filename
      );
      break;

    case 'webpack':
      command = which.sync('webpack');
      args.unshift(
        '--watch',
        '--output-file',
        filename
      );
      break;

    case 'typescript':
      command = which.sync('tsc');
      args.unshift(
        '--watch',
        '--out',
        filename
      );
      break;

    case 'coffeescript':
      command = which.sync('coffee');
      args.unshift(
        '--watch',
        '--compile',
        '--output',
        dirpath
      );
      break;

    case 'babel':
      command = which.sync('babel');
      args.unshift(
        '--watch',
        '--out-file',
        filename
      );
      break;
  }

  var compiler = child.spawn(command, args);

  var filenames = Object.keys(scripts);
  async.until(function() {
    return filenames.every(function(filename) {
      return fs.existsSync(filename) && fs.statSync(filename).size > 1;
    });
  }, function(callback) {
    setTimeout(callback, 100);
  }, function() {
    compiler.emit('ready', scripts);
  });

  return compiler;
}

module.exports = compile;

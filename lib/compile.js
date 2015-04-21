var path = require('path');
var temp = require('temp');
var child = require('child_process');
var which = require('which');
var fs = require('fs');

function compile(options, callback) {
  var dirpath = temp.mkdirSync('amok-output');
  options.output = path.join(dirpath, path.basename(options.args[0].replace(/\.[^\.]+$/, '.js')));

  var args = options.compiler.match(/'[^"]*'|"[^"]*"|\S+/g);
  var command = args.shift();

  switch (options.compiler) {
    case 'browserify':
      command = which.sync('watchify');
      args = [
        '-o',
        options.output
      ];
      break;

    case 'webpack':
      command = which.sync('webpack');
      args = [
        '--watch',
        '--output-file',
        options.output
      ];
      break;

    case 'typescript':
      command = which.sync('tsc');
      args = [
        '--watch',
        '--out',
        options.output
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
        options.output
      ];
      break;
  }

  args = args.concat(options.args);

  var compiler = child.spawn(command, args);
  compiler.output = options.output;

  process.nextTick(function tick() {
    fs.exists(compiler.output, function(exists) {
      if (exists) {
        callback(null, compiler.stdout, compiler.stderr);
      } else {
        setTimeout(tick, 100);
      }
    });
  });

  return compiler;
}

module.exports = compile;

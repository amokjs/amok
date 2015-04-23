var path = require('path');
var temp = require('temp');
var child = require('child_process');
var which = require('which');

function compile(options) {
  var dirpath = temp.mkdirSync('amok-output');
  var output = path.join(dirpath, path.basename(options.args[0].replace(/\.[^\.]+$/, '.js')));

  var args = options.compiler.match(/'[^"]*'|"[^"]*"|\S+/g);
  var command = args.shift();

  switch (options.compiler) {
    case 'browserify':
      command = which.sync('watchify');
      args = [
        '-o',
        output
      ];
      break;

    case 'webpack':
      command = which.sync('webpack');
      args = [
        '--watch',
        '--output-file',
        output
      ];
      break;

    case 'typescript':
      command = which.sync('tsc');
      args = [
        '--watch',
        '--out',
        output
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
        output
      ];
      break;
  }

  args = args.concat(options.args);

  var compiler = child.spawn(command, args);
  compiler.output = output;

  process.nextTick(function tick() {
    fs.exists(compiler.output, function(exists) {
      if (exists) {
        compiler.emit('ready');
      } else {
        setTimeout(tick, 100);
      }
    });
  });

  return compiler;
}

module.exports = compile;

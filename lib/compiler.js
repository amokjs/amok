const fs = require('fs');
const path = require('path');
const script = require('compiler_process');
const temp = require('temp');
const util = require('util');

const debug = util.debuglog('amok-compiler');

function plugin(command, args, output) {
  if (typeof args == 'undefined') {
    args = [];
  }

  return function compiler(inspector, runner, done) {
    var entry = args.filter(function(arg) {
      return arg.match(/(.js|.ts|.coffee)$/);
    })[0];

    var dirname = temp.mkdirSync(command);
    var pathname = entry;
    var basename = path.basename(pathname);
    var filename = path.join(dirname, basename).replace(/\.[^\.]+$/, '.js');

    var scripts = {};
    scripts[pathname] = filename;
    runner.set('scripts', scripts);

    args.unshift.apply(args, script.options(command, {
      outfile: filename,
      watch: true,
    }));

    debug('spawn %s %s', command, args.join(' '));
    script.spawn(command, args, function(error, compiler) {
      if (error) {
        debug('bail %s', error.description);
        return done(error);
      }

      if (output) {
        compiler.stdout.pipe(output);
        compiler.stderr.pipe(output);
      }

      runner.once('close', function kill() {
        debug('kill');
        compiler.kill('SIGTERM');
      });

      debug('wait %s', filename);
      process.nextTick(function wait() {
        fs.stat(filename, function(error, stat) {
          if (error || stat.size === 0) {
            return process.nextTick(wait);
          }

          setTimeout(function() {
            debug('ready');
            done();
          }, 250);
        });
      });
    });
  };
}

module.exports = plugin;

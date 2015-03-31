#!/usr/bin/env node


var amok = require('./'),
    async = require('async'),
    cmd = require('commander'),
    fs = require('fs'),
    path = require('path'),
    temp = require('temp'),
    repl = require('repl'),
    util = require('util'),
    pkg = require('./package.json');


cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', 'specify http host', 'localhost');
cmd.option('-p, --port <PORT>', 'specify http port', 9966);

cmd.option('-H, --debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('-P, --debugger-port <PORT>', 'specify debugger port', 9222);

cmd.option('-i, --interactive', 'enable interactive mode');

cmd.option('--client <CMD>', 'specify the client to spawn');
cmd.option('--compiler <CMD>', 'specify the compiler to spawn');

cmd.option('-v, --verbose', 'enable verbose logging mode');

cmd.option('--no-client', 'disable client');
cmd.option('--no-compiler', 'disable compilation');

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();
if (cmd.client !== false) {
  cmd.client = process.env['AMOK_CLIENT'];
}

if (cmd.compiler !== false) {
  cmd.compiler = process.env['AMOK_COMPILER'];
}


async.auto({

  compiler: function(callback, data) {
    if (cmd.compiler) {
      if (cmd.verbose) {
        console.info('Spawning compiler...');
      }

      temp.track();
      temp.mkdir('amok', function(err, dirpath) {
        cmd.output = path.join(dirpath, 'bundle.js');
        cmd.scripts = { 'bundle.js': cmd.output };

        var compiler = amok.compile(cmd, function(error, stdout, stderr) {
          if (error) {
            return callback(error);
          }

          stdout.pipe(process.stdout);
          stderr.pipe(process.stderr);

          process.nextTick(function tick() {
            fs.exists(cmd.output, function(exists) {
              if (exists) {
                return callback(null, compiler);
              } else {
                setTimeout(tick, 100);
              }
            });
          });
        });
      });

    } else {
      cmd.scripts = cmd.args.reduce(function(object, value, key) {
        object[value] = path.resolve(value);
        return object;
      }, {});

      callback(null, null);
    }
  },


  watcher: ['compiler', 'bugger', function(callback, data) {
    var watcher = amok.watch(cmd, function() {
      if (cmd.verbose) {
        console.info('File watcher ready');
      }

      watcher.on('change', function(filename) {
        if (cmd.verbose) {
          console.info(filename, 'changed');
        }

        var script = Object.keys(cmd.scripts).filter(function(key) {
          return cmd.scripts[key] === filename
        })[0];

        if (script) {
          if (cmd.verbose) {
            console.info('Re-compiling', script, '...');
          }

          fs.readFile(filename, 'utf-8', function(error, contents) {
            if (error) {
              return console.error(error);
            }

            data.bugger.source(script, contents, function(error) {
              if (error) {
                return console.error(error);
              }

              if (cmd.verbose) {
                console.info('Re-compilation succesful');
              }
            });
          });
        }
      });

      callback(null, watcher);
    });
  }],


  server: ['compiler', function(callback, data) {
    if (cmd.verbose) {
      console.info('Starting server...');
    }

    var server = amok.serve(cmd, function() {
      var address = server.address();
      if (cmd.verbose) {
        console.info('Server listening on http://%s:%d', address.address, address.port);
      }

      callback(null, server);
    });
  }],


  client: ['server', function(callback, data) {
    if (cmd.client) {
      if (cmd.verbose) {
        console.log('Spawning client...');
      }

      var client = amok.open(cmd, function(error, stdout, stderr) {
        if (error) {
          process.stdout.write(error);
        }

        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

        setTimeout(function () {
          callback(null, client);
        }, 1000);
      });
    } else {
      callback(null, null);
    }
  }],


  bugger: ['client', function(callback, data) {
    if (cmd.verbose) {
      console.info('Attaching debugger...');
    }

    var bugger = amok.debug(cmd, function(error, target) {
      if (error) {
        callback(error);
      }

      if (cmd.verbose) {
        console.info('Debugger attached to', target.title);
      }

      callback(null, bugger);
    });
  }],


  interactor: ['bugger', function(callback, data) {
    if (cmd.interactive) {
      var options = {
        prompt: '> ',
        input: process.stdin,
        output: process.stdout,
        writer: function(result) {
          if (result.value) {
            return util.inspect(result.value, {
              colors: true,
            });
          } else if (result.objectId) {
            return util.format('[class %s]\n%s', result.className, result.description);
          }
        },

        eval: function (cmd, context, filename, write) {
          data.bugger.evaluate(cmd, function(error, result) {
            write(error, result);
          });
        },
      };

      var interactor = repl.start(options);
      callback(null, interactor);
    } else {
      callback(null, null);
    }
  }],

}, function(error) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

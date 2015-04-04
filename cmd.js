#!/usr/bin/env node

var amok = require('./');
var async = require('async');
var cmd = require('commander');
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var repl = require('repl');
var util = require('util');

var pkg = require('./package.json');

cmd.usage('[options] <script>');

cmd.option('-h, --host <HOST>', 'specify http host', 'localhost');
cmd.option('-p, --port <PORT>', 'specify http port', 9966);

cmd.option('-H, --debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('-P, --debugger-port <PORT>', 'specify debugger port', 9222);

cmd.option('-i, --interactive', 'enable interactive mode');

cmd.option('--client <CMD>', 'specify the client to spawn');
cmd.option('--compiler <CMD>', 'specify the compiler to spawn');

cmd.option('--css <FILE(S)>', 'comma-separated list of css files to preload');
cmd.option('--js <FILE(S)>', 'comma-separated list of JS files to preload');
cmd.option('--head', 'inject preloaded JS into <head> (default)');
cmd.option('--body', 'inject preloaded JS into <body>');
cmd.option('--div', 'inject a <div> with id="main" into <body>');

cmd.option('-v, --verbose', 'enable verbose logging mode');

cmd.version(pkg.version);
cmd.parse(process.argv);

cmd.cwd = process.cwd();

function compiler(callback, data) {
  if (cmd.compiler) {
    if (cmd.verbose) {
      console.info('Spawning compiler...');
    }

    temp.track();
    temp.mkdir('amok', function(error, dirpath) {
      if (error) {
        return callback(error);
      }

      var compiler = amok.compile(cmd, function(error, stdout, stderr) {
        if (error) {
          return callback(error);
        }

        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);

        cmd.scripts = {
          'bundle.js': compiler.output,
        };

        callback(null, compiler);
      });
    });

  } else {
    cmd.scripts = cmd.args.reduce(function(object, value, key) {
      object[value] = path.resolve(value);
      return object;
    }, {});

    callback(null, null);
  }
}

function watcher(callback, data) {
  var watcher = amok.watch(cmd, function() {
    if (cmd.verbose) {
      console.info('File watcher ready');
    }

    watcher.on('change', function(filename) {
      if (cmd.verbose) {
        console.info(filename, 'changed');
      }

      var script = Object.keys(cmd.scripts)
        .filter(function(key) {
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
}

function server(callback, data) {
  if (cmd.verbose) {
    console.info('Starting server...');
  }

  var server = amok.serve(cmd, function() {
    var address = server.address();
    if (cmd.verbose) {
      console.info('Server listening on http://%s:%d', address.address,
        address.port);
    }

    callback(null, server);
  });
}

function client(callback, data) {
  if (cmd.client) {
    if (cmd.verbose) {
      console.log('Spawning client...');
    }

    var client = amok.open(cmd, function(error, stdout, stderr) {
      if (error) {
        return callback(error);
      }

      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);

      callback(null, client);
    });
  } else {
    callback(null, null);
  }
}

function bugger(callback, data) {
  if (cmd.verbose) {
    console.info('Attaching debugger...');
  }

  var bugger = amok.debug(cmd, function(error, target) {
    if (error) {
      return callback(error);
    }

    if (cmd.verbose) {
      console.info('Debugger attached to', target.title);
    }

    bugger.console.on('data', function(message) {
      if (message.parameters) {
        var parameters = message.parameters.map(function(parameter) {
          return parameter.value;
        });

        if (console[message.level]) {
          console[message.level].apply(console, parameters);
        }
      }
    });

    callback(null, bugger);
  });
}

function prompt(callback, data) {
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

      eval: function(cmd, context, filename, write) {
        data.bugger.evaluate(cmd, function(error, result) {
          write(error, result);
        });
      },
    };

    var prompt = repl.start(options);
    callback(null, prompt);
  } else {
    callback(null, null);
  }
}

async.auto({
  'compiler': [compiler],
  'server': ['compiler', server],
  'client': ['server', client],
  'bugger': ['client', bugger],
  'watcher': ['bugger', watcher],
  'prompt': ['bugger', prompt],
}, function(error, data) {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});

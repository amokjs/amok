#!/usr/bin/env node

var amok = require('./');
var async = require('async');
var cmd = require('commander');
var fs = require('fs');
var path = require('path');
var temp = require('temp');
var repl = require('repl');
var util = require('util');
var colors = require('colors');

var pkg = require('./package.json');

cmd.usage('[options] <script>');
cmd.version(pkg.version);

cmd.option('--host <HOST>', 'specify http host', 'localhost');
cmd.option('--port <PORT>', 'specify http port', 9966);

cmd.option('--debugger-host <HOST>', 'specify debugger host', 'localhost');
cmd.option('--debugger-port <PORT>', 'specify debugger port', 9222);

cmd.option('-i, --interactive', 'enable interactive mode');

cmd.option('--client <CMD>', 'specify the client to spawn');
cmd.option('--compiler <CMD>', 'specify the compiler to spawn');

cmd.option('-v, --verbose', 'enable verbose logging mode');

cmd.parse(process.argv);

cmd.cwd = process.cwd();

function compiler(callback, data) {
  if (cmd.compiler === undefined) {
    cmd.scripts = cmd.args.reduce(function(object, value, key) {
      object[value] = path.resolve(value);
      return object;
    }, {});

    return callback(null, null);
  }

  if (cmd.verbose) {
    console.info('Spawning compiler...');
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
}

function watcher(callback, data) {
  for (file in cmd.scripts) {
    fs.lstat(cmd.scripts[file], function(err, stats) {
      if (err && err.code === 'ENOENT') {
        console.error('[ERROR] Input file "%s" was not found'.red, file);
      }
    });
  }

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
  if (cmd.client === undefined) {
    return callback(null, null);
  }

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
  if (cmd.interactive === undefined) {
    return callback(null, null);
  }

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

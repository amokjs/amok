#!/usr/bin/env node

var amok = require('../');
var async = require('async');
var bistre = require('bistre');
var bole = require('bole');
var fs = require('fs');
var package = require('../package.json');
var path = require('path');
var program = require('commander');
var repl = require('repl');
var url = require('url');
var util = require('util');

program.usage('[options] <script | url>');
program.version(package.version);

program.option('-s, --debug-host <HOST>', 'specify debug host', 'localhost');
program.option('-r, --debug-port <PORT>', 'specify debug port', 9222);
program.option('-b, --browser <BROWSER>', 'specify browser');
program.option('-c, --compiler <COMPILER>', 'specify compiler');
program.option('-a, --host <HOST>', 'specify http host', 'localhost');
program.option('-p, --port <PORT>', 'specify http port', 9966);
program.option('-w, --watch <GLOB>', 'specify watch pattern', null);
program.option('-i, --interactive', 'enable interactive mode');
program.option('-v, --verbose', 'enable verbose mode');
program.option('-d, --cwd <DIR>', 'change working directory', process.cwd());

program.parse(process.argv);

if (program.args.length < 1) {
  program.help();
}

var scripts = program.args.filter(function(arg) {
  return arg.match(/[^\\/]+$/);
});

var url = program.args.filter(function(arg) {
  return arg.match(/^(http|https):\/\//);
}).pop();

program.scripts = scripts.reduce(function(object, value, key) {
  object[path.resolve(value)] = value;
  return object;
}, {});

program.url = url;

var transform = bistre.createStream();
transform.pipe(process.stderr);

bole.output({
  level: program.verbose ? 'debug' : 'error',
  stream: transform
});

async.auto({
  compiler: function(callback, data) {
    if (program.compiler === undefined) {
      return callback(null, null);
    }

    var log = bole('compiler');
    log.info('spawn');

    var compiler = amok.compile(program.compiler, program.args, {
      cwd: program.cwd,
    });

    compiler.on('ready', function(scripts) {
      log.info('ok', { pid: compiler.pid });

      program.scripts = scripts;

      compiler.stdout.on('data', function(data) {
        log.info(data.toString());
      });

      compiler.stderr.on('data', function(data) {
        log.error(data.toString());
      });

      process.on('exit', function() {
        compiler.kill('SIGTERM');
      });

      callback(null, compiler);
    });
  },
  debugger: ['browser', 'watcher', function(callback, data) {
    var log = bole('debugger');
    log.info('connect');

    var bugger = amok.debug(program.debugPort, program.debugHost, {
      scripts: program.scripts,
      url: program.url,
      watcher: data.watcher,
    });

    bugger.once('attach', function() {
      callback(null, bugger);
    });

    bugger.on('source', function(script) {
      log.info('source', { url: script.url });
    });

    bugger.on('attach', function(target) {
      log.info('attach', { url: target.url, title: target.title });
    });

    bugger.on('detatch', function() {
      log.warn('detatch');
    });

    bugger.on('error', function(error) {
      log.error(error);
    });
  }],

  browser: ['server', function(callback, data) {
    var log = bole('browser');

    if (program.browser === undefined) {
      log('skip');
      return callback(null, null);
    }

    log.info('spawn');
    var args = [
      program.url
    ];

    var options = {
      debugPort: program.debugPort,
    };

    amok.browse(program.browser, program.url, options, function(error, browser) {
      if (error) {
        return callback(error);
      }

      log.info('ok', { pid: browser.pid });

      browser.on('error', function(error) {
        log.error(error);
        process.exit(error.errno);
      });

      browser.stdout.on('data', function(data) {
        log.info(data.toString());
      });

      browser.stderr.on('data', function(data) {
        log.warn(data.toString());
      });

      process.on('exit', function() {
        browser.kill('SIGTERM');
      });

      callback(null, browser);
    });
  }],

  server: ['compiler', function(callback, data) {
    var log = bole('http');

    if (program.url) {
      log.info('skip');
      return callback(null, null);
    }

    log.info('starting');
    var options = {
      cwd: program.cwd,
      scripts: program.scripts
    };

    var server = amok.serve(program.port, program.host, options, function(error, server) {
      var address = server.address();
      log.info('listening', { host: address.address, port: address.port });

      server.on('request', function(request, response) {
        log.info(request);
      });

      server.on('error', function(error) {
        log.error(error);
      });

      program.url = util.format('http://%s:%d', program.host, program.port);
      callback(null, server);
    });
  }],

  watcher: ['compiler', function(callback, data) {
    var log = bole('watch');

    log.info('start');

    var patterns = [];
    if (program.watch) {
      patterns.push(program.watch);
    }

    var filenames = Object.keys(program.scripts);
    if (filenames.length > 0) {
      patterns.push(path.dirname(filenames[0]));
    }

    var watcher = amok.watch(patterns, function(error, watcher) {
      log.info('ok');

      watcher.on('add', function(filename) {
        log.info('add', { filename: filename });
      });

      watcher.on('unlink', function(filename) {
        log.info('remove', { filename: filename, pathname: filename });
      });

      watcher.on('change', function(filename) {
        log.info('change', { filename: filename });
      });

      watcher.on('error', function(error) {
        log.error(error);
      });

      callback(null, watcher);
    });
  }],

  repl: ['debugger', function(callback, data) {
    var log = bole('repl');

    if (!program.interactive) {
      log('skip');
      return callback(null, null);
    }

    log('start');

    var options = {};
    amok.repl(data.debugger, options, function(error, repl) {
      callback(null, repl);
    });
  }]
});

process.on('SIGTERM', function() {
  process.exit(0);
});

process.on('SIGINT', function() {
  process.exit(0);
});

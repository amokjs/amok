'use strict';

var browser = require('browser_process');
var net = require('net');
var path = require('path');
var rdbg = require('rdbg');
var os = require('os');
var url = require('url');
var util = require('util');

var debug = util.debuglog('amok-browse');

function browse(port, command, args, options) {
  if (typeof args === 'undefined') {
    args = [];
  } else {
    args = args.slice(0);
  }

  return function browse(client, runner, done) {
    var server = net.createServer();

    server.once('error', function(error) {
      debug('server error', error);
      done(error);
    });

    server.once('listening', function() {
      debug('server listening');

      debug('close server');
      server.close();
    });

    server.once('close', function() {
      debug('server close');

      // TODO, move into browser_process.createProfile, deleting the first run file
      // should be equivilent of providing these options, and be compatible with how firefox does it.
      args.unshift('--no-first-run', '--no-default-browser-check');
      args.unshift.apply(args, browser.options(command, {
        profile: path.join(os.tmpdir(), `${command}-${port}`),
        url: runner.get('url'),
        debug: port,
      }));

      debug('spawn %s %s', command, args.join(' '));
      browser.spawn(command, args, options, function (error, ps) {
        if (error) {
          debug('bail %s', error.description);
          return done(error);
        }

        runner.once('close', function kill() {
          debug('kill process');
          ps.kill('SIGTERM');
        });

        debug('find %s', url);
        (function search() {
          rdbg.get(port, 'localhost', function (error, targets) {

            let target = (targets || []).find(target => {
              return /^(http|file|about):/.exec(target.url);
            })

            if (target) {
              runner.set('url', target.url);
              return done();
            }

            setTimeout(search, 1000);
          });
        }());
      });
    });

    debug('starting server on port', port);
    server.listen(port);
  };
}

module.exports = browse;

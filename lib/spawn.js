'use strict';

const child = require('child_process');
const net = require('net');
const rdbg = require('rdbg');
const util = require('util');
const path = require('path');
const which = require('which');

const debug = util.debuglog('amok-spawn');

function spawn(port, args, options) {
  function spawn(client, runner, callback) {
    let server = net.createServer();
    server.once('error', callback);
    server.once('close', () => {
      which('node', (error, node) => {
        if (error) {
          return callback(error);
        }

        which('bugger', (error, command) => {
          if (error) {
            return callback(error);
          }

          args.unshift(command, '--port', port);
          let bugger = child.spawn(node, args, options);
          runner.bugger = bugger;

          (function search() {
            rdbg.get(port, 'localhost', (error, targets) => {
              let target = (targets || []).find(target => {
                return target.url.match(/^file:/);
              });

              if (target) {
                runner.set('url', target.url);
                return callback();
              }

              setTimeout(search, 1000);
            });
          }());
        });
      });
    });

    server.listen(port, () => {
      server.close();
    });
  }

  spawn.close = function close(context, done) {
    debug('close');

    let ps = context.bugger;
    if (ps) {
      ps.once('close', done);
      return ps.kill();
    }

    done();
  };

  return spawn;
}

module.exports = spawn;

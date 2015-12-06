'use strict';

const child = require('child_process');
const net = require('net');
const rdbg = require('rdbg');
const util = require('util');
const which = require('which');

const debug = util.debuglog('amok-spawn');

function spawn(port, args, options) {
  return function spawn(client, runner, callback) {
    debug('spawn', port, args, options);

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
          runner.on('close', () => {
            bugger.kill();
          });

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
}

module.exports = spawn;

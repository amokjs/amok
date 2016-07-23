'use strict';

const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-watch');

function watch(glob) {
  function watch(client, runner, done) {
    var cwd = runner.get('cwd');
    if (cwd) {
      cwd = path.resolve(cwd);
    } else {
      cwd = process.cwd();
    }

    debug('watch %s', glob);
    var watcher = chokidar.watch(glob, {
      ignoreInitial: true,
      cwd: cwd,
    });

    watcher.once('error', (error) => {
      debug('error %s', util.inspect(error));
      watcher.removeListener('error', done);
      done(error);
    });

    watcher.once('ready', () => {
      debug('ready');
      done();
    });

    runner.once('close', () => {
      debug('close');
      watcher.close();
    });

    client.on('close', () => {
      watcher.removeAllListeners('all');
    });

    client.on('connect', () => {
      var events = {
        'add': 'fileCreate',
        'change': 'fileChange',
        'unlink': 'fileRemove',
      };

      watcher.on('all', (event, filename) => {
        debug('%s %s', events[event], filename);

        var payload = JSON.stringify({
          detail: {
            filename: url.resolve('/', filename).slice(1)
          }
        });

        var cmd = `
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('${events[event]}', {
              detail: {
                filename: '${url.resolve('/', filename).slice(1)}',
              },
            }));
          }

          if (typeof process !== 'undefined') {
            process.emit('${events[event]}', '${filename}');
          }
        `;

        client.runtime.evaluate(cmd, (error, result) => {
          if (error) {
            return client.emit('error', error);
          }
        });
      });

      client.runtime.enable(error => {
        if (error) {
          return client.emit('error', error);
        }
      });
    });
  }

  return watch;
}

module.exports = watch;

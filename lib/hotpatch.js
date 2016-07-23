'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-hotpatch');

function hotpatch() {
  return function hotpatch(client, runner, done) {
    let cwd = runner.get('cwd');
    if (cwd) {
      cwd = path.resolve(cwd);
    } else {
      cwd = process.cwd();
    }

    let scripts = {};
    let watchers = {};


    client.debugger.on('clear', () => {
      debug('clear');
      scripts = {};

      Object.keys(watchers).forEach(key => {
        watchers[key].close();
      });

      watchers = {};
    });

    client.debugger.on('scriptParse', script => {
      if (!/^(http|file)/.exec(script.url)) {
        return;
      }

      debug('parse %s', util.inspect(script));

      let uri = url.parse(script.url);
      let sources = runner.get('scripts') || {};


      let filename = null;
      if (uri.protocol.match(/file/)) {
        filename = path.normalize(uri.pathname);
      } else if (uri.protocol.match(/http/)) {
        filename = uri.pathname.slice(1);

        if (sources[path.normalize(filename)]) {
          filename = sources[path.normalize(filename)];
        }
      }


      if (!filename || !fs.existsSync(filename)) {
        return debug('skipping %s', filename);
      }

      scripts[filename] = script;

      let dirname = path.dirname(filename);
      if (watchers[dirname]) {
        return;
      }

      debug('watch directory %s', dirname);
      let watcher = fs.watch(dirname);
      watchers[dirname] = watcher;

      let streams = {};
      watcher.on('change', (event, filename) => {
        if (!filename) {
          return;
        }

        filename = path.resolve(dirname, filename);

        let script = scripts[filename];
        if (!script) {
          return;
        }

        debug(event, filename);
        if (streams[filename]) {
          return;
        }

        let source = '';
        let stream = fs.createReadStream(filename);
        streams[filename] = stream;

        stream.setEncoding('utf-8');
        stream.on('data', chunk => {
          source += chunk;
        });

        stream.on('end', () => {
          streams[filename] = null;

          if (source.length === 0) {
            return;
          }

          debug('patch script %s (%d bytes) ', script.url, source.length);
          client.debugger.setScriptSource(script.scriptId, source, (error, result) => {
            if (error) {
              return client.emit('error', error);
            }

            let payload = JSON.stringify({
              detail: {
                filename: path.relative(cwd, filename),
              }
            });


            var cmd = `
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('scriptChange', {
                  detail: {
                    filename: '${path.relative(cwd, filename)}',
                  },
                }));
              }

            if (typeof process !== 'undefined') {
              process.emit('scriptChange', '${filename}');
            }
            `;

            debug('evaluate patch event');
            client.runtime.evaluate(cmd, error => {
              if (error) {
                debug('evaluate error %s', util.inspect(error));
                return client.emit('error', error);
              }
            });
          });
        });
      });
    });

    client.on('close', () => {
      debug('close');
      scripts = {};

      Object.keys(watchers).forEach(key => {
        watchers[key].close();
      });

      watchers = {};
    });

    client.on('connect', () => {
      client.debugger.enable(error => {
        if (error) {
          return client.emit('error', error);
        }
      });

      client.runtime.enable(error => {
        if (error) {
          return client.emit('error', error);
        }
      });
    });

    done();
  };
}

module.exports = hotpatch;

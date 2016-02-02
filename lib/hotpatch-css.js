'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-hotpatch-css');

function hotpatch() {
  return function hotpatch(client, runner, done) {
    let cwd = runner.get('cwd');
    if (cwd) {
      cwd = path.resolve(cwd);
    } else {
      cwd = process.cwd();
    }

    let stylesheets = {};
    let watchers = {};

    let clearWatchers = () => {
      debug('clear');
      stylesheets = {};

      Object.keys(watchers).forEach(key => {
        watchers[key].close();
      });

      watchers = {};
    };

    let onStyleSheetAdd = stylesheet => {
      debug('parse %s', util.inspect(stylesheet));

      if (stylesheet.origin !== 'regular') {
        debug("Ignoring css of origin %s", stylesheet.origin);
        return;
      }

      // TODO: inline stylesheet support
      if (stylesheet.isInline) {
        debug("Ignoring inline css");
        return;
      }

      let uri = url.parse(stylesheet.sourceURL);
      let pageUri = url.parse(runner.get('url') || '');
      let filename = null;
      // let sources = runner.get('stylesheets') || {};

      if (uri.protocol === 'file:') {
        filename = path.normalize(uri.pathname);
        if (filename.match(/^\\[a-zA-Z]:\\/)) {
          filename = filename.slice(1);
        }
      } else if (uri.protocol === 'http:') {
        filename = uri.pathname.slice(1);
        // if (sources[path.normalize(filename)]) {
        //   filename = path.resolve(sources[path.normalize(filename)]);
        // } else
        if (uri.host === pageUri.host) {
          filename = path.resolve(cwd, filename);
        } else {
          filename = null;
        }
      }

      if (!filename) {
        return;
      }

      stylesheets[filename] = stylesheet;

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

        let stylesheet = stylesheets[filename];
        if (!stylesheet) {
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

          debug('patch stylesheet %s (%d bytes) ', stylesheet.sourceURL, source.length);
          client.request("CSS.setStyleSheetText", {
            styleSheetId: stylesheet.styleSheetId,
            text: source
          }, (error, result) => {
            if (error) {
              debug('set css text error %s', util.inspect(error));
              return client.emit('error', error);
            }

            let payload = JSON.stringify({
              detail: {
                filename: path.relative(cwd, filename),
              }
            });

            let cmd = [
              'var event = new CustomEvent(\'stylesheetChange\',' + payload + ');',
              'window.dispatchEvent(event);',
            ].join('\n');

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
    };

    client.on('message', (method, params) => {
      if (method === 'CSS.styleSheetAdded') {
        onStyleSheetAdd(params.header);
      } else if (method === 'DOM.documentUpdated') {
        clearWatchers();
      }
      // else if (method === 'CSS.styleSheetRemoved') {
      //
      // } else if (method === 'CSS.styleSheetChanged') {
      //
      // }
    });

    client.on('close', () => {
      debug('close');
      stylesheets = {};

      Object.keys(watchers).forEach(key => {
        watchers[key].close();
      });

      watchers = {};
    });

    client.on('connect', () => {
      // CSS domain requires DOM
      client.request('DOM.enable', error => {
        if (error) {
          return client.emit('error', error);
        }

        client.request('CSS.enable', error => {
          if (error) {
            return client.emit('error', error);
          }
        });
      });
    });

    done();
  };
}

module.exports = hotpatch;

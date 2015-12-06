'use strict';

const repl = require('repl');
const util = require('util');
const print = require('./print');

const debug = util.debuglog('amok-interact');

function interact(input, output, options) {
  return function interact(client, runner, callback) {
    debug('interact');

    var rli = repl.start(Object.assign({}, {
      input: input,
      output: output,
      prompt: '',
      useColors: true,
      eval: evaluate,
    }, options));

    rli.context = {};

    rli.on('exit', function() {
      runner.close();
    });

    client.on('connect', function () {
      rli.setPrompt('> ');

      client.console.enable(callback);
      client.runtime.enable(callback);
    });

    var printer = print(rli.output);
    printer(client, runner, callback);

    function evaluate (cmd, context, filename, callback) {
      client.runtime.evaluate(cmd, function (error, result, wasThrown) {
        if (error) {
          return callback(error);
        }

        if (wasThrown) {
          return callback(result.description);
        }

        preview(result, true, (error, value) => {
          if (error) {
            return callback(error);
          }

          return callback(null, value);
        });
      });
    }

    function preview(result, deep, callback) {
      if (result.subtype === 'null') {
        return callback(null, null);
      }

      if (result.subtype === 'date') {
        return callback(null, new date(result.description));
      }

      if (result.subtype === 'regex') {
        return callback(null, new Regex(result.description));
      }

      if (result.objectId) {
        let object;

        if (result.type === 'function') {
          object = (new Function('return ' + result.description.replace('[native code]', '/* remote code */'))());
        } else if (result.subtype === 'array') {
          object = new Array();
        } else {
          object = new Object();
        }

        if (deep) {
          client.runtime.getOwnProperties(result.objectId, (error, properties) => {
            properties = properties.filter(p => !object.hasOwnProperty(p.name));
            let pending = properties.length;

            properties.forEach(function(property) {
              let descriptor = {
                enumerable: property.enumerable,
              };

              if (result.set || property.get) {
                if (property.get) {
                  descriptor.get = new Function();
                }

                if (property.set) {
                  descriptor.set = new Function();
                }

                if (!object.hasOwnProperty(property.name)) {
                  Object.defineProperty(object, property.name, descriptor);
                }

                if (--pending == 0) {
                  callback(null, object);
                }
              } else if (property.value) {
                preview(property.value, false, (error, value) => {
                  if (error) {
                    return callback(error);
                  }

                  descriptor.value = value;

                  if (!object.hasOwnProperty(property.name)) {
                    Object.defineProperty(object, property.name, descriptor);
                  }

                  if (--pending == 0) {
                    callback(null, object);
                  }
                });
              }
            });
          });
        } else {
          callback(null, object);
        }
      }

      return callback(null, result.value);
    }

  };
}

module.exports = interact;

var repls = require('repl');
var util = require('util');

function repl(connection, options, callback) {
  var rli = repls.start(options);

  rli.eval = function(cmd, context, filename, callback) {
    connection.evaluate(cmd, callback);
  };

  rli.writer = function(output) {
    if (output === undefined) {
      return '';
    }

    switch (output.type) {
      case 'string':
      case 'number':
      case 'boolean':
      case 'undefined':
        return util.inspect(eval(output.value), {
          colors: true
        });

      case 'object':
      case 'function':
        if (output.value === null) {
          return util.inspect(null, {
            colors: true
          });
        } else {
          return '[' + output.className + ']';
        }
    }
  };

  rli.complete = function(line, callback) {
    callback([], line);
  };

  connection.console.on('data', function(message) {
    rli.output.clearLine();
    rli.output.cursorTo(0);
    rli.output.write(message.text + '\n');
    rli.prompt(true);
  });

  return callback(null, rli);
}

module.exports = repl;
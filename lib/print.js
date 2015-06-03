const util = require('util');

const debug = util.debuglog('amok-print');

function plugin(output) {
  return function print(inspector, runner, done) {
    inspector.console.on('data', function(message) {
      output.write(message.text + '\n');
    });

    debug('ready');
    done();
  };
}

module.exports = plugin;

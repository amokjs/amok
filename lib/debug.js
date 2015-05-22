var extend = require('extend');
var fs = require('fs');
var path = require('path');
var rdbg = require('rdbg');
var repl = require('repl');
var url = require('url');
var util = require('util');

function debug(port, host) {
  var options = extend({
    cwd: process.cwd(),
  }, arguments[2] === undefined ? {} : arguments[2]);

  var bugger = rdbg.connect(port, host);
  var reattach = function() {
    bugger.targets(function(targets) {
      var target = targets.filter(function(target) {
        return target.url.search(options.url) > -1 && target.webSocketDebuggerUrl;
      })[0];

      if (target !== undefined) {
        bugger.attach(target);
      } else {
        setTimeout(reattach, 250);
      }
    });
  };

  bugger.console.on('data', function(message) {
    console.log(message.text);
  });

  bugger.on('detatch', reattach);
  process.nextTick(reattach);

  return bugger;
}

module.exports = debug;

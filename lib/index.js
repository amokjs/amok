const events = require('events');
const util = require('util');
const ware = require('ware');
const rdbg = require('rdbg');
const url = require('url');

const debug = util.debuglog('amok');

function Runner() {
  events.EventEmitter.call(this);

  this.inspector = rdbg.createInspector();
  this.plugins = [];

  this.settings = {
    cwd: process.cwd(),
    url: '',
    scripts: {},
  };
}

util.inherits(Runner, events.EventEmitter);

Runner.prototype.get = function(name) {
  return this.settings[name];
};

Runner.prototype.set = function(name, value) {
  debug('set %s', name, value);
  this.settings[name] = value;
};

Runner.prototype.use = function(fn) {
  debug('use %s', fn._name || fn.name || '-');
  this.plugins.push(fn);

  return this;
};

Runner.prototype.run = function(callback) {
  debug('run');

  var stack = ware(this.plugins);
  stack.run(this.inspector, this, callback);
};

Runner.prototype.connect = function(port, host, callback) {
  this.set('port', port);
  this.set('host', host);

  this.run(function(error, inspector, runner) {
    if (error) {
      return callback(error);
    }

    debug('connect');

    inspector.once('error', function(error) {
      callback(error);
    });

    inspector.once('attach', function(target) {
      debug('attach %s - %s', target.title, target.url);
      callback(null, inspector, runner);
    });

    process.nextTick(function attach() {
      inspector.getTargets(port, host, function(error, targets) {
        if (error) {
          return callback(error);
        }

        var target = targets.filter(function(target) {
          return runner.get('url') === target.url;
        })[0];

        inspector.attach(target);
      });
    });
  });
};

Runner.prototype.close = function() {
  debug('close');

  if (this.inspector) {
    this.inspector.detatch();
  }

  this.emit('close');
};

Runner.prototype.createRunner = function() {
  return new Runner();
};

module.exports = new Runner();

module.exports.browser = require('./browser');
module.exports.compiler = require('./compiler');
module.exports.hotpatch = require('./hotpatch');
module.exports.repl = require('./repl');
module.exports.server = require('./server');
module.exports.watch = require('./watch');
module.exports.print = require('./print');

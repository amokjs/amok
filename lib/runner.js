'use strict';

const events = require('events');
const rdbg = require('rdbg');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok');

class Runner extends events.EventEmitter {
  constructor() {
    super();

    this._client = new rdbg.Client();
    this.plugins = [];

    this.settings = {};
  }

  get client() {
    return this._client;
  }

  get(name) {
    return this.settings[name];
  }

  set(name, value) {
    debug('set %s', name, value);
    this.settings[name] = value;
  }

  use(fn) {
    debug('use %s', fn._name || fn.name || '-');
    this.plugins.push(fn);

    return this;
  }

  run(callback) {
    debug('run');

    if (callback) {
      this.on('run', callback);
    }

    var stack = this.plugins.slice(0);
    let next = (error) => {
      if (error) {
        return this.emit('error', error);
      }

      let fn = stack.shift();
      if (fn) {
        return fn(this.client, this, next);
      }

      this.emit('run');
    };

    next(null);
  }

  connect(port, host, callback) {
    function connect(client, runner, done) {
      rdbg.get(port, host, (error, targets) => {
        if (error) {
          return done(error);
        }

        if (callback) {
          client.on('connect', callback);
        }

        client.on('connect', () => {
          runner.emit('connect');
        });

        var target = targets.filter(function (target) {
          return runner.get('url') === url.format(url.parse(target.url));
        })[0];

        client.connect(target.webSocketDebuggerUrl);
      });
    }

    connect.close = function close(context, done) {
      let client = context.client;
      if (client && client.socket) {
        client.once('close', done);
        return client.close();
      }

      done();
    };

    this.use(connect);
    this.run();
  }

  close(callback) {
    debug('close');

    if (callback) {
      this.on('close', callback);
    }

    var stack = this.plugins.filter(fn => fn.close);
    let next = () => {
      let fn = stack.pop();
      if (fn) {
        return fn.close(this, next);
      }

      this.emit('close');
    };

    next(null);
  }
}

function createRunner() {
  return new Runner();
}

module.exports = createRunner();
module.exports.createRunner = createRunner;
module.exports.Runner = Runner;

'use strict';

const events = require('events');
const rdbg = require('rdbg');
const url = require('url');
const util = require('util');
const ware = require('ware');

const debug = util.debuglog('amok');

class Runner extends events.EventEmitter {
  constructor() {
    super();

    this._client = new rdbg.Client();
    this._plugins = [];
    this._settings = [];
  }

  get client() {
    return this._client;
  }

  get plugins() {
    return this._client;
  }

  get(key, value) {
    return this._settings[key];
  }

  set(key, value) {
    debug('set %s', key, value);
    this._settings[key] = value;
  }

  use(fn) {
    debug('use %s', fn._name || fn.name || '-');
    this._plugins.push(fn);
    return this;
  }

  run(callback) {
    debug('run');

    var stack = ware(this._plugins);
    stack.run(this.client, this, callback);
  }

  connect(port, host, callback) {
    if (callback) {
      this.on('connect', callback);
    }

    this.run(error => {
      if (error) {
        return this.emit('error', error);
      }

      this.client.once('connect', () => {
        debug('connect');
        this.emit('connect');
      });

      rdbg.get(port, host, (error, targets) => {
        if (error) {
          return this.emit('error', error);
        }

        var target = targets.find(target => {
          return this.get('url') === target.url;
        });

        this.client.connect(target.webSocketDebuggerUrl);
      });
    });
  }

  close() {
    if (this.client) {
      this.client.close();
    }

    this.emit('close');
  }
}

module.exports = createRunner();

function createRunner() {
  return new Runner();
}

module.exports.createRunner = createRunner;

module.exports.Runner = Runner;

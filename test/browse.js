'use strict';

const amok = require('..');
const http = require('http');
const net = require('net');
const path = require('path');
const test = require('tape');
const url = require('url');

test('error when port is in use', assert => {
  assert.plan(2);

  var server = net.createServer();
  server.on('listening', function() {
    var runner = amok.createRunner();

    runner.use(amok.browse(4000, 'chrome'));

    runner.once('error', error => {
      assert.equal(error.code, 'EADDRINUSE');

      runner.once('close', () => {
        server.once('close', () => {
          assert.pass('close');
        });

        server.close();
      });

      runner.close();
    });

    runner.connect(4000, 'localhost');
  });

  server.listen(4000);
});

const browsers = [
  'chrome',
  'chromium'
];

browsers.reduce((entries, browser) => {
  entries.push({
    browser,
    url: 'test/fixture/browse/index.html',
  });

  entries.push({
    browser,
    url: path.resolve('test/fixture/browse/index.html'),
  });

  entries.push({
    browser,
    url: 'browse/index.html',
    options: {
      cwd: 'test/fixture/',
    }
  });

  entries.push({
    browser,
    url: 'index.html',
    options: {
      cwd: 'test/fixture/browse',
    }
  });

  return entries;
}, []).forEach(entry => {
  test(`browse file url ${entry.url} in ${entry.browser}`, assert => {
    assert.plan(2);
    let runner = amok.createRunner();

    runner.use(amok.browse(4000, entry.browser, [entry.url], entry.options));
    runner.once('connect', () => {
      assert.equal(runner.get('url'), `file://${path.resolve('test/fixture/browse/index.html')}`);

      runner.on('close', () => {
        assert.pass('close');
      });

      runner.close();
    });

    runner.connect(4000, 'localhost');
  });
});

browsers.reduce((entries, browser) => {
  entries.push({
    browser,
    url: 'http://localhost:8080',
  });

  entries.push({
    browser,
    url: 'http://localhost:8080/',
  });
  return entries;
}, []).forEach(entry => {
  test(`browse file url ${entry.url} in ${entry.browser}`, assert => {
    assert.plan(2);

    let server = http.createServer();
    server.once('listening', () => {
      server.on('request', (request, response) => {
        response.end();
      });

      let runner = amok.createRunner();

      runner.set('url', entry.url);
      runner.use(amok.browse(4000, entry.browser, [], entry.options));
      runner.once('connect', () => {
        assert.equal(runner.get('url'), `http://localhost:8080/`);

        runner.on('close', () => {
          server.once('close', () => {
            assert.pass('close');
          });

          server.close();
        });

        runner.close();
      });

      runner.connect(4000, 'localhost');
    });

    server.listen(8000);
  });
});

'use strict';

const amok = require('..');
const fs = require('fs');
const http = require('http');
const path = require('path');
const test = require('tape');
const url = require('url');

const browsers = [
  'chrome',
  'chromium'
];

browsers.reduce((entries, browser) => {
  entries.push({
    browser,
    url: 'test/fixture/hotpatch-browser/index.html',
    filename: 'test/fixture/hotpatch-browser/index.js'
  });

  entries.push({
    browser,
    url: path.resolve('test/fixture/hotpatch-browser/index.html'),
    filename: 'test/fixture/hotpatch-browser/index.js'
  });

  entries.push({
    browser,
    url: 'hotpatch-browser/index.html',
    options: {
      cwd: 'test/fixture/',
    },
    filename: 'test/fixture/hotpatch-browser/index.js',
  });

  entries.push({
    browser,
    url: 'index.html',
    options: {
      cwd: 'test/fixture/hotpatch-browser',
    },
    filename: 'test/fixture/hotpatch-browser/index.js',
  });

  return entries;
}, []).concat([
  {
    url: 'test/fixture/hotpatch-node/index.js',
    filename: 'test/fixture/hotpatch-node/index.js',
  },
  {
    url: 'index.js',
    filename: 'test/fixture/hotpatch-node/index.js',
    options: {
      cwd: 'test/fixture/hotpatch-node',
    }
  }
]).forEach((entry, index) => {
  test(`hotpatch ${entry.url} with ${entry.browser || 'node'}`, assert => {
    assert.plan(14);

    let runner = amok.createRunner();

    if (entry.browser) {
      runner.use(amok.browse(4000, entry.browser, [entry.url], entry.options));
    } else {
      runner.use(amok.spawn(4000, [entry.url], entry.options));
    }

    runner.use(amok.hotpatch());

    runner.once('connect', () => {
      assert.comment('connect');

      let messages = [
        'ready',
        'step-0',
        'step-1',
        'step-2',
        'step-3',
        'step-4',
        'step-5',
        'step-6',
        'step-7',
        'step-8',
        'step-9',
        'step-0',
      ];

      let source = fs.readFileSync(entry.filename, 'utf-8');

      runner.client.console.on('data', function (message) {
        assert.equal(message.text, messages.shift(), message.text);

        if (messages.length == 0) {
          runner.once('close', () => {
            assert.pass('close');
          });

          return runner.close();
        }

        if (message.text.match(/step/)) {
          source = source.replace(message.text, messages[0]);
        }

        fs.writeFileSync(entry.filename, source, 'utf-8');
      });

      runner.client.console.enable(error => {
        assert.error(error);
      });
    });

    runner.connect(4000);
  });
});

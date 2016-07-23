'use strict';

const amok = require('..');
const fs = require('fs');
const path = require('path');
const test = require('tape');
const url = require('url');

const port = process.env['TEST_PORT'] || 4000;

test(`watch events in node`, assert => {
  assert.plan(7);

  let runner = amok.createRunner();
  runner.set('cwd', 'test/fixture/watch-spawn');

  runner.use(amok.spawn(port, ['test/fixture/watch-spawn/index.js'], {
    stdio: 'inherit'
  }));

  runner.use(amok.watch('*.txt'));

  runner.once('connect', () => {
    assert.pass('connect');

    let messages = [
      'ready',
      'fileCreate file.txt',
      'fileChange file.txt',
      'fileRemove file.txt'
    ];

    runner.client.console.on('data', message => {
      assert.equal(message.text, messages.shift(), message.text);

      if (messages.length == 0) {
        runner.once('close', () => {
          assert.pass('close');
        });

        return runner.close();
      }

      if (message.text === 'ready') {
        setTimeout(() => {
          fs.writeFileSync('test/fixture/watch-spawn/file.txt', 'hello', 'utf-8');
        }, 1000);
      } else if (message.text === 'fileCreate file.txt') {
        setTimeout(() => {
          fs.writeFileSync('test/fixture/watch-spawn/file.txt', 'hello world', 'utf-8');
        }, 1000);
      } else if (message.text === 'fileChange file.txt') {
        setTimeout(() => {
          fs.unlinkSync('test/fixture/watch-spawn/file.txt');
        }, 1000);
      }
    });

    runner.client.console.enable(function (error) {
      assert.error(error);
    });
  });

  runner.connect(port);
});

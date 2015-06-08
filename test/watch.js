const amok = require('..');
const fs = require('fs');
const test = require('tape');
const url = require('url');
const path = require('path');

const browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(browser, index) {
  test('watch events in ' + browser, function(test) {
    test.plan(8);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html')));

    runner.set('cwd', 'test/fixture/watch-events');
    runner.use(amok.browser(browser));
    runner.use(amok.watch('*.txt'));

    runner.connect(4000 + index, 'localhost', function(error, inspector, runner) {
      test.error(error);
      test.ok(inspector, 'inspector');
      test.ok(runner, 'runner');

      var messages = [
        'ready',
        'add file.txt',
        'change file.txt',
        'unlink file.txt'
      ];

      inspector.console.on('data', function(message) {
        test.equal(message.text, messages.shift(), message.text);

        if (message.text === 'ready') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');
        } else if (message.text === 'add file.txt') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');
        } else if (message.text === 'change file.txt') {
          fs.unlinkSync('test/fixture/watch-events/file.txt');
        }

        if (messages.length === 0) {
          runner.close();
        }
      });
    });
  });
});

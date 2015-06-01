const amok = require('..');
const fs = require('fs');
const test = require('tape');

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

    runner.set('url', 'file://' + __dirname + '/fixture/watch-events/index.html');

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

        if (messages.length === 0) {
          runner.close();
        }
      });

      setTimeout(function() {
        fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');

        setTimeout(function() {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');

          setTimeout(function() {
            fs.unlinkSync('test/fixture/watch-events/file.txt');
          }, 250);
        }, 250);
      }, 250);
    });
  });
});

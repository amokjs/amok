var amok = require('..');
var fs = require('fs');
var test = require('tape');
var url = require('url');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function (browser, index) {
  test('watch events in ' + browser, function (test) {
    test.plan(9);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html')));
    runner.set('port', 4000 + index);

    runner.set('cwd', 'test/fixture/watch-events');
    runner.use(amok.browser(browser));
    runner.use(amok.watch('*.txt'));

    runner.connect(runner.get('port'), 'localhost', function () {
      test.pass('connect');

      var values = [
        'ready',
        'add dir',
        'add dir/file.txt',
        'change dir/file.txt',
        'unlink dir/file.txt',
        'unlink dir'
      ];

      runner.client.console.on('data', function (message) {
        test.equal(message.text, values.shift(), message.text);

        if (values[0] === undefined) {
          runner.close();
        } if (message.text === 'ready') {
          fs.mkdirSync('test/fixture/watch-events/dir');
        } else if (message.text === 'add dir') {
          fs.writeFileSync('test/fixture/watch-events/dir/file.txt', 'hello', 'utf-8');
        } else if (message.text === 'add dir/file.txt') {
          fs.writeFileSync('test/fixture/watch-events/dir/file.txt', 'hello world', 'utf-8');
        } else if (message.text === 'change dir/file.txt') {
          fs.unlinkSync('test/fixture/watch-events/dir/file.txt');
        } else if (message.text === 'unlink dir/file.txt') {
          fs.rmdirSync('test/fixture/watch-events/dir');
        }
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});

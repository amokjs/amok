var amok = require('..');
var fs = require('fs');
var path = require('path');
var test = require('tape');
var url = require('url');

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('watch events in ' + browser, function (test) {
    test.plan(7);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/watch/index.html')));

    runner.set('cwd', 'test/fixture/watch');
    runner.use(amok.browse(port, browser));
    runner.use(amok.watch('*.txt'));

    runner.connect(port, 'localhost', function () {
      test.pass('connect');

      var values = [
        'ready',
        'fileCreate file.txt',
        'fileChange file.txt',
        'fileRemove file.txt'
      ];

      runner.client.console.on('data', function (message) {
        test.equal(message.text, values.shift(), message.text);

        if (values[0] === undefined) {
          runner.close();
        } if (message.text === 'ready') {
          fs.writeFileSync('test/fixture/watch/file.txt', 'hello', 'utf-8');
        } else if (message.text === 'fileCreate file.txt') {
          fs.writeFileSync('test/fixture/watch/file.txt', 'hello world', 'utf-8');
        } else if (message.text === 'fileChange file.txt') {
          fs.unlinkSync('test/fixture/watch/file.txt');
        }
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});

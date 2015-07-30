var amok = require('..');
var test = require('tape');
var stream = require('stream');
var url = require('url');
var path = require('path');

var browsers = [
  'chrome',
];

browsers.forEach(function (browser, index) {
  var port = 4000 + index;

  test('open url in ' + browser, function (test) {
    test.plan(3);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));

    var output = new stream.Writable();
    output._write = function (chunk, encoding, callback) {
      test.assert(chunk, 'ready\n');
      runner.close();
    };

    runner.use(amok.browser(port, browser));
    runner.use(amok.print(output));

    runner.connect(port, 'localhost', function () {
      test.pass('connect');
    });
  });
});

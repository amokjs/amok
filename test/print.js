const amok = require('..');
const test = require('tape');
const stream = require('stream');
const url = require('url');
const path = require('path');

const browsers = [
  'chrome',
  'chromium',
];

browsers.forEach(function(browser, index) {
  test('open url in ' + browser, function(test) {
    test.plan(2);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));

    var output = new stream.Writable();
    output._write = function(chunk, encoding, callback) {
      test.assert(chunk, 'ready\n');
      runner.close();
    };

    runner.use(amok.browser(browser));
    runner.use(amok.print(output));

    runner.connect(4000 + index, 'localhost', function(error, inspector, runner) {
      test.error(error);
      test.ok(inspector);
      test.ok(runner);
    });
  });
});

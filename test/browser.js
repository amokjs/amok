const amok = require('..');
const test = require('tape');

const commands = [
  'chrome',
  'chromium',
];

commands.forEach(function(command, index) {
  test('open url in ' + command, function(test) {
    test.plan(5);

    var runner = amok.createRunner();
    runner.on('close', function() {
      test.pass('close');
    });

    runner.set('url', 'file://' + __dirname + '/fixture/basic/index.html');

    runner.use(amok.browser(command));
    runner.connect(4000 + index, 'localhost', function(error, inspector, runner) {
      test.error(error);
      test.ok(inspector);
      test.ok(runner);

      inspector.console.on('data', function(message) {
        test.equal(message.text, 'ready');
        runner.close();
      });
    });
  });
});

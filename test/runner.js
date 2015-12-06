var amok = require('..');
var test = require('tape');

test('run plugins', function (test) {
  test.plan(4);

  var runner = amok.createRunner();
  runner.on('close', function () {
    test.pass();
  });

  runner.use(function one(client, runner, done) {
    test.pass();
    done();
  });

  runner.use(function two(client, runner, done) {
    test.pass();
    done();
  });

  runner.run(function ready(error, client, runner) {
    test.error(error);
    runner.close();
  });
});

var amok = require('..');
var net = require('net');
var test = require('tape');
var url = require('url');
var path = require('path');

var commands = [
  'chrome',
  'chromium',
];

commands.forEach(function (command, index) {
  var port = 4000 + index;

  test('open url in ' + command, function (test) {
    test.plan(3);

    var runner = amok.createRunner();
    runner.on('close', function () {
      test.pass('close');
    });

    runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));

    runner.use(amok.browser(port, command));
    runner.connect(port, 'localhost', function () {
      runner.client.console.on('data', function (message) {
        test.equal(message.text, 'ready');

        setTimeout(function () {
          runner.close();
        }, 100);
      });

      runner.client.console.enable(function (error) {
        test.error(error);
      });
    });
  });
});

commands.forEach(function (command, index) {
  test('error when port is used in ' + command, function (test) {
    test.plan(2);
    test.timeoutAfter(5000);

    var server = net.createServer();
    server.on('close', function() {
      test.pass();
    });

    server.on('listening', function() {
      var address = server.address();
      var port = address.port;

      var runner = amok.createRunner();
      server.on('close', function () {
        runner.close();
      });

      runner.set('url', url.resolve('file://', path.join('/' + __dirname, '/fixture/basic/index.html')));
      runner.use(amok.browser(port, command));

      runner.on('error', function(error) {
        test.equal(error.code, 'EADDRINUSE');
        server.close();
      });

      runner.connect(port, 'localhost');
    });

    server.listen(0);
  });
});

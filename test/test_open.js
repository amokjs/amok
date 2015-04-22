var amok = require('../');
var test = require('tape');

var browsers = ['chrome', 'chromium'];

for (var i = 0; i < browsers.length; i++) {
  var browser = browsers[i];

  test('open ' + browser, function (t) {
    var options = {
      client: browser,
      url: 'about:blank'
    };

    var client = amok.open(options, function () {
      t.ok(client.pid);
      client.kill();
    });

    client.on('close', function (code) {
      t.equal(code, 0);
      t.end();
    });
  });
}
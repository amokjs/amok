var amok = require('../');
var test = require('tape');
var fs = require('fs');

test('compile with browserify', function(t) {
  var args = [
    'test/fixture/bundle.js'
  ];

  var exe = amok.compile('browserify', args);
  exe.stderr.on('data', function(data) {
    data = data.toString();
    t.fail(data);
  });

  exe.on('ready', function(scripts) {
    var filenames = Object.keys(scripts);
    t.equal(filenames.length, 1);

    var stats = fs.statSync(filenames[0]);
    t.ok(stats.size > 1);

    var pathnames = filenames.map(function(filename) {
      return scripts[filename];
    });

    t.equal(pathnames.length, 1);
    t.equal(pathnames[0], 'test/fixture/bundle.js');

    exe.kill();
  });

  exe.on('close', function(code, signal) {
    t.end();
  });
});

var amok = require('../');
var test = require('tape');
var fs = require('fs');

test('compile to automatic file', function(t) {
  var compilers = [
    {
      name: 'babel',
      args: [
        'test/fixture/bundle.js'
      ]
    },
    {
      name: 'browserify',
      args: [
        'test/fixture/bundle.js'
      ]
    },
    {
      name: 'browserify',
      args: [
        'test/fixture/bundle-babel.js',
        '--transform',
        'babelify'
      ]
    },
    {
      name: 'coffeescript',
      args: [
        'test/fixture/coffeescript.coffee'
      ]
    },
    {
      name: 'webpack',
      args: [
        'test/fixture/bundle.js'
      ]
    },
    {
      name: 'webpack',
      args: [
        'test/fixture/bundle-babel.js',
        '--module-bind',
        'js=babel'
      ]
    }
  ];

  compilers.forEach(function(compiler) {
    t.test(function(t) {
      var exe = amok.compile(compiler.name, compiler.args, compiler.options);
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
        t.equal(pathnames[0], compiler.args[0].replace(/\.[^.]*$/, '.js'));

        exe.kill();
      });

      exe.on('close', function(code, signal) {
        t.end();
      });
    });
  });
});

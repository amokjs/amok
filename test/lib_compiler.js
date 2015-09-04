var amok = require('..');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var commands = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack'
];

commands.forEach(function (command, index) {
  test('compile with ' + command, function (test) {
    test.plan(5);

    var runner = amok.createRunner();

    var dirname = 'test/fixture/compile-' + command;
    var entries = fs.readdirSync(dirname).map(function (filename) {
      return path.join(dirname, filename);
    }).filter(function (filename) {
      return filename.search('out') === -1;
    });

    runner.use(amok.compiler(command, entries));
    runner.run(function (error, client, runner) {
      test.error(error);
      test.ok(client, 'client');
      test.ok(runner, 'runner');

      var scripts = runner.get('scripts');
      var pathnames = Object.keys(scripts);
      var filename = scripts[pathnames[0]];

      test.equal(pathnames.length, 1);
      test.equal(pathnames[0], path.normalize(pathnames[0]));
      test.equal(fs.readFileSync(filename, 'utf-8'), fs.readFileSync(path.join(dirname, 'out.js'), 'utf-8'));
      runner.close();
    });
  });
});

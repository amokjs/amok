const amok = require('..');
const test = require('tape');
const fs = require('fs');
const path = require('path');

const commands = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack'
];

commands.forEach(function(command, index) {
  test('compile with ' + command, function(test) {
    test.plan(5);

    var runner = amok.createRunner();

    var dirname = 'test/fixture/compile-' + command;
    var entries = fs.readdirSync(dirname).map(function(filename) {
      return path.join(dirname, filename);
    }).filter(function(filename) {
      return filename.search('out') === -1;
    });

    runner.use(amok.compiler(command, entries));
    runner.run(function(error, inspector, runner) {
      test.error(error);
      test.ok(inspector, 'inspector');
      test.ok(runner, 'runner');

      var scripts = runner.get('scripts');
      var pathnames = Object.keys(scripts);
      var filename = scripts[pathnames[0]];

      test.equal(pathnames.length, 1);
      test.equal(fs.readFileSync(filename, 'utf-8'), fs.readFileSync(path.join(dirname, 'out.js'), 'utf-8'));
      runner.close();
    });
  });
});

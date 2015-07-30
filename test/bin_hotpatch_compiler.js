var child = require('child_process');
var http = require('http');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var url = require('url');
var sculpt = require('sculpt');

var bin = require('../package.json').bin['amok'];

var browsers = [
  'chrome',
];

var compilers = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

browsers.forEach(function (browser) {
  compilers.forEach(function (compiler, index) {
    test('bin hot patch basic compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(13);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var args = [
        bin,
        '--port',
        9966 + index,
        '--hot',
        '--compiler',
        compiler,
        '--browser',
        browser,
        entries[0]
      ];

      test.comment(args.join(' '));

      var ps = child.spawn('node', args);
      ps.stderr.pipe(process.stderr);

      ps.on('close', function () {
        test.pass('close');
      });

      var values = [
        'ready',
        'step-0',
        'step-1',
        'step-2',
        'step-3',
        'step-4',
        'step-5',
        'step-6',
        'step-7',
        'step-8',
        'step-9',
        'step-0',
      ];

      var source = fs.readFileSync(entries[0], 'utf-8');
      ps.stdout.setEncoding('utf-8');
      ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
        if (line.length === 0) {
          return;
        }

        test.equal(line, values.shift(), line);

        if (values[0] === undefined) {
          ps.kill('SIGTERM')
        } else if (line.match(/step/)) {
          source = source.replace(line, values[0]);

          setTimeout(function () {
            fs.writeFileSync(entries[0], source, 'utf-8');
          }, 1000);
        }
      });
    });
  });
});
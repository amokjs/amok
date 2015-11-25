var child = require('child_process');
var fs = require('fs');
var http = require('http');
var path = require('path');
var sculpt = require('sculpt');
var test = require('tape');
var url = require('url');

var bin = require('../package.json').bin['amok'];

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

var compilers = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

browsers.forEach(function (browser) {
  compilers.forEach(function (compiler, index) {
    var dirname = 'test/fixture/hotpatch-' + compiler;
    var entries = fs.readdirSync(dirname).map(function (filename) {
      return path.join(dirname, filename);
    }).filter(function (filename) {
      return filename.match(/(.js|.ts|.coffee)$/);
    });

    var args = [
      bin,
      '--hot',
      '--compiler',
      compiler,
      '--browser',
      browser,
      entries[0]
    ];

    test(args.join(' '), function (test) {
      test.plan(12);

      var ps = child.spawn('node', args);
      ps.stderr.pipe(process.stderr);

      ps.on('close', function () {
        test.pass('close');
      });

      var values = [
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

          setTimeout(function() {
            fs.writeFileSync(entries[0] + '.tmp', source, 'utf-8');
            fs.renameSync(entries[0] + '.tmp', entries[0]);
          }, 1000);
        }
      });
    });
  });
});
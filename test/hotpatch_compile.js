var amok = require('..');
var fs = require('fs');
var path = require('path');
var test = require('tape');

var browsers = (process.env['TEST_BROWSERS'] || 'chrome,chromium').split(',');

browsers.forEach(function (browser, index) {
  var port = 4000 + index;
  var compilers = [
    'babel',
    'coffee',
    'tsc',
    'watchify',
    'webpack',
  ];

  compilers.forEach(function (compiler) {
    test('hot patch basic script compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(14);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var runner = amok.createRunner();
      runner.on('close', function () {
        test.pass('close');
      });

      runner.use(amok.serve(9966, 'localhost'));
      runner.use(amok.compile(compiler, entries, {
        stdio: 'inherit'
      }));

      runner.use(amok.browse(port, browser));
      runner.use(amok.hotpatch());

      runner.connect(port, 'localhost', function () {
        test.pass('connect');

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

        runner.client.console.on('data', function (message) {
          test.equal(message.text, values.shift(), message.text);

          if (values[0] === undefined) {
            runner.close();
          } else if (message.text.match(/step/)) {
            source = source.replace(message.text, values[0]);

            setTimeout(function() {
              fs.writeFileSync(entries[0] + '.tmp', source, 'utf-8');
              fs.renameSync(entries[0] + '.tmp', entries[0]);
            }, 1000);
          }
        });

        runner.client.console.enable(function (error) {
          test.error(error);
        });
      });
    });
  });
});

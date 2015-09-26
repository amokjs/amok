var amok = require('..');
var test = require('tape');
var fs = require('fs');
var path = require('path');

var browsers = [
  'chrome',
  'chromium',
];

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
      test.plan(35);

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

      runner.use(amok.server(9966, 'localhost'));
      runner.use(amok.compiler(compiler, entries, {
        stdio: 'inherit'
      }));

      runner.use(amok.browser(port, browser));
      runner.use(amok.hotpatch());

      runner.connect(port, 'localhost', function () {
        test.pass('connect');

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

        runner.client.console.on('data', function (message) {
          test.equal(message.text, values.shift(), message.text);

          if (values[0] === undefined) {
            runner.close();
          } else if (message.text.match(/step/)) {
            source = source.replace(message.text, values[0]);
            test.notEqual(source, fs.readFileSync(entries[0]));

            setTimeout(function () {
              fs.writeFile(entries[0], source, 'utf-8', function (error) {
                test.error(error);
              });
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
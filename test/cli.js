const child = require('child_process');
const http = require('http');
const test = require('tape');
const fs = require('fs');
const path = require('path');
const url = require('url');

const browsers = [
  'chrome',
  'chromium',
];

const compilers = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

test('print version', function(test) {
  test.plan(4);
  var options = [
    '-V',
    '--version'
  ];

  options.forEach(function(option) {
    var args = ['bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function(data) {
      var message = data.toString();
      test.equal(message, require('../package.json').version + '\n');
    });

    cli.on('close', function(code) {
      test.equal(code, 0);
    });
  });
});

test('cli print help', function(test) {
  test.plan(4);
  var options = [
    '-h',
    '--help'
  ];

  options.forEach(function(option) {
    var args = ['./bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function(data) {
      var message = data.toString();
      test.ok(message.indexOf('Usage:') > -1);
    });

    cli.on('close', function(code) {
      test.equal(code, 0);
    });
  });
});

browsers.forEach(function(browser) {
  test('hot patch basic with file url in ' + browser, function(test) {
    test.plan(12);

    var args = [
      'bin/amok.js',
      '--hot',
      '**/*.js',
      '--browser',
      browser,
      url.resolve('file://', path.join('/' + __dirname, '/fixture/hotpatch-basic/index.html'))
    ];

    test.comment(args.join(' '));

    var cli = child.spawn('node', args);
    cli.stderr.pipe(process.stderr);

    cli.on('close', function() {
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

    var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function(chunk) {
      chunk.split('\n').forEach(function(line) {
        if (line === '') {
          return;
        }

        test.equal(line, values.shift(), line);

        if (values[0] === undefined) {
          return cli.kill('SIGTERM');
        }

        setTimeout(function() {
          source = source.replace(line, values[0]);
          fs.writeFileSync('test/fixture/hotpatch-basic/index.js', source, 'utf-8');
        }, 50);
      });
    });
  });


  compilers.forEach(function(compiler, index) {
    test('hot patch script compiled with ' + compiler + ' in ' + browser, function(test) {
      test.plan(12);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function(filename) {
        return path.join(dirname, filename);
      }).filter(function(filename) {
        return filename.match(/(.js|.ts|.coffee)$/);
      });

      var args = [
        'bin/amok.js',
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

      var cli = child.spawn('node', args);
      cli.stderr.pipe(process.stderr);

      cli.on('close', function() {
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
      cli.stdout.setEncoding('utf-8');
      cli.stdout.on('data', function(chunk) {
        chunk.split('\n').forEach(function(line) {
          if (line === '') {
            return;
          }

          test.equal(line, values.shift(), line);

          if (values[0] === undefined) {
            return cli.kill('SIGTERM');
          }

          setTimeout(function() {
            source = source.replace(line, values[0]);
            fs.writeFileSync(entries[0], source, 'utf-8');
          }, 1000);
        });
      });
    });
  });

  test('print watch events with file url in ' + browser, function(test) {
    test.plan(5);

    var args = [
      'bin/amok.js',
      '--cwd',
      'test/fixture/watch-events',
      '--watch',
      '*.txt',
      '--browser',
      browser,
      url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html'))
    ];

    test.comment(args.join(' '));

    var cli = child.spawn('node', args);
    cli.stderr.pipe(process.stderr);
    cli.on('close', function() {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add file.txt',
      'change file.txt',
      'unlink file.txt'
    ];

    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function(chunk) {
      chunk.split('\n').forEach(function(line) {
        if (line === '') {
          return;
        }

        test.equal(line, messages.shift(), line);

        if (line === 'ready') {
          setTimeout(function() {
            fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');

            setTimeout(function() {
              fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');

              setTimeout(function() {
                fs.unlinkSync('test/fixture/watch-events/file.txt');
              }, 250);
            }, 250);
          }, 250);
        }

        if (messages.length === 0) {
          cli.kill();
        }
      });
    });
  });
  test('print watch events with server in ' + browser, function(test) {
    test.plan(5);

    var args = [
      'bin/amok.js',
      '--watch',
      '**/*.txt',
      '--browser',
      browser,
      'test/fixture/watch-events/index.js',
    ];

    test.comment(args.join(' '));

    var cli = child.spawn('node', args);
    cli.stderr.pipe(process.stderr);
    cli.on('close', function() {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add test/fixture/watch-events/file.txt',
      'change test/fixture/watch-events/file.txt',
      'unlink test/fixture/watch-events/file.txt'
    ];

    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function(chunk) {
      chunk.split('\n').forEach(function(line) {
        if (line === '') {
          return;
        }

        test.equal(line, messages.shift(), line);

        if (line === 'ready') {
          setTimeout(function() {
            fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');

            setTimeout(function() {
              fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');

              setTimeout(function() {
                fs.unlinkSync('test/fixture/watch-events/file.txt');
              }, 250);
            }, 250);
          }, 250);
        }

        if (messages.length === 0) {
          cli.kill();
        }
      });
    });
  });
});

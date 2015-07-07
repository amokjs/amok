var child = require('child_process');
var http = require('http');
var test = require('tape');
var fs = require('fs');
var path = require('path');
var url = require('url');

var browsers = [
  'chrome',
  'chromium',
];

var compilers = [
  'babel',
  'coffee',
  'tsc',
  'watchify',
  'webpack',
];

test('print version', function (test) {
  test.plan(4);
  var options = [
    '-V',
    '--version'
  ];

  options.forEach(function (option) {
    var args = ['bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function (data) {
      var message = data.toString();
      test.equal(message, require('../package.json').version + '\n');
    });

    cli.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});

test('cli print help', function (test) {
  test.plan(4);
  var options = [
    '-h',
    '--help'
  ];

  options.forEach(function (option) {
    var args = ['./bin/amok.js', option];
    test.comment(args.join(' '));

    var cli = child.spawn('node', args);

    cli.stdout.on('data', function (data) {
      var message = data.toString();
      test.ok(message.indexOf('Usage:') > -1);
    });

    cli.on('close', function (code) {
      test.equal(code, 0);
    });
  });
});

browsers.forEach(function (browser) {
  test('hot patch basic with file url in ' + browser, function (test) {
    test.plan(23);

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

    cli.on('close', function () {
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

    var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function (chunk) {
      chunk.split('\n').forEach(function (line) {
        if (line.length === 0) {
          return;
        }

        test.comment(line);
        test.equal(line, values.shift(), line);

        if (values[0] === undefined) {
          cli.kill('SIGTERM')
        } else if (line.match(/^step/)) {
          source = source.replace(line, values[0]);

          fs.writeFile('test/fixture/hotpatch-basic/index.js', source, 'utf-8', function (error) {
            test.error(error);
          });
        }
      });
    });
  });
});

browsers.forEach(function (browser) {
  test('hot patch basic with server in ' + browser, function (test) {
    test.plan(13);

    var args = [
      'bin/amok.js',
      '--hot',
      '--browser',
      browser,
      'test/fixture/hotpatch-basic/index.js'
    ];

    test.comment(args.join(' '));

    var cli = child.spawn('node', args);
    cli.stderr.pipe(process.stderr);

    cli.on('close', function () {
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

    var source = fs.readFileSync('test/fixture/hotpatch-basic/index.js', 'utf-8');
    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function (chunk) {
      chunk.split('\n').forEach(function (line) {
        if (line.length === 0) {
          return;
        }

        test.equal(line, values.shift(), line);

        if (values[0] === undefined) {
          cli.kill('SIGTERM')
        } else if (line.match(/^step/)) {
          source = source.replace(line, values[0]);

          fs.writeFileSync('test/fixture/hotpatch-basic/index.js', source, 'utf-8');
        }
      });
    });
  });
});

browsers.forEach(function (browser) {
  compilers.forEach(function (compiler, index) {
    test('hot patch basic compiled with ' + compiler + ' in ' + browser, function (test) {
      test.plan(13);

      var dirname = 'test/fixture/hotpatch-' + compiler;
      var entries = fs.readdirSync(dirname).map(function (filename) {
        return path.join(dirname, filename);
      }).filter(function (filename) {
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

      cli.on('close', function () {
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
      cli.stdout.setEncoding('utf-8');
      cli.stdout.on('data', function (chunk) {
        chunk.split('\n').forEach(function (line) {
          if (line === '') {
            return;
          }

          test.equal(line, values.shift(), line);

          if (values[0] === undefined) {
            cli.kill('SIGTERM')
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
});

browsers.forEach(function (browser) {
  test('print watch events with file url in ' + browser, function (test) {
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
    cli.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add file.txt',
      'change file.txt',
      'unlink file.txt'
    ];

    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function (chunk) {
      chunk.split('\n').forEach(function (line) {
        if (line.length === 0) {
          return;
        }

        test.equal(line, messages.shift(), line);

        if (line === 'ready') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');
        } else if (line === 'add file.txt') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');
        } else if (line === 'change file.txt') {
          fs.unlinkSync('test/fixture/watch-events/file.txt');
        }

        if (messages.length === 0) {
          cli.kill();
        }
      });
    });
  });
});

browsers.forEach(function (browser) {
  test('print watch events with server in ' + browser, function (test) {
    test.plan(5);

    var args = [
      'bin/amok.js',
      '--cwd',
      'test/fixture/watch-events',
      '--watch',
      '**/*.txt',
      '--browser',
      browser,
      'index.js',
    ];

    test.comment(args.join(' '));

    var cli = child.spawn('node', args);
    cli.stderr.pipe(process.stderr);
    cli.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add file.txt',
      'change file.txt',
      'unlink file.txt'
    ];

    cli.stdout.setEncoding('utf-8');
    cli.stdout.on('data', function (chunk) {
      chunk.split('\n').forEach(function (line) {
        if (line === '') {
          return;
        }

        test.equal(line, messages.shift(), line);

        if (line === 'ready') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');
        } else if (line === 'add file.txt') {
          fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');
        } else if (line === 'change file.txt') {
          fs.unlinkSync('test/fixture/watch-events/file.txt');
        }

        if (messages.length === 0) {
          cli.kill();
        }
      });
    });
  });
});
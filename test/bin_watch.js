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

browsers.forEach(function (browser) {
  test('print watch events with file url in ' + browser, function (test) {
    test.plan(5);

    var args = [
      bin,
      '--cwd',
      'test/fixture/watch-events',
      '--watch',
      '*.txt',
      '--browser',
      browser,
      url.resolve('file://', path.join('/' + __dirname, '/fixture/watch-events/index.html'))
    ];

    test.comment(args.join(' '));

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);
    ps.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add file.txt',
      'change file.txt',
      'unlink file.txt'
    ];

    ps.stdout.setEncoding('utf-8');
    ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
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
        ps.kill();
      }
    });
  });
});

browsers.forEach(function (browser) {
  test('print watch events with server in ' + browser, function (test) {
    test.plan(5);

    var args = [
      bin,
      '--watch',
      '**/*.txt',
      '--browser',
      browser,
      'test/fixture/watch-events/index.js',
    ];

    test.comment(args.join(' '));

    var ps = child.spawn('node', args);
    ps.stderr.pipe(process.stderr);
    ps.on('close', function () {
      test.pass('close');
    });

    var messages = [
      'ready',
      'add test/fixture/watch-events/file.txt',
      'change test/fixture/watch-events/file.txt',
      'unlink test/fixture/watch-events/file.txt'
    ];

    ps.stdout.setEncoding('utf-8');
    ps.stdout.pipe(sculpt.split(/\r?\n/)).on('data', function (line) {
      if (line.length === 0) {
        return;
      }

      test.equal(line, messages.shift(), line);

      if (line === 'ready') {
        fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello', 'utf-8');
      } else if (line === 'add test/fixture/watch-events/file.txt') {
        fs.writeFileSync('test/fixture/watch-events/file.txt', 'hello world', 'utf-8');
      } else if (line === 'change test/fixture/watch-events/file.txt') {
        fs.unlinkSync('test/fixture/watch-events/file.txt');
      }

      if (messages.length === 0) {
        ps.kill();
      }
    });
  });
});

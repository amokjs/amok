var amok = require('..');
var test = require('tape');
var url = require('url');
var http = require('http');
var fs = require('fs');
var path = require('path');

test('serve index.html', function (test) {
  test.plan(8);

  var runner = amok.createRunner();
  test.on('end', function () {
    runner.close();
  });

  var pathnames = ['/', '/index.html'];

  runner.set('cwd', 'test/fixture/basic');
  runner.use(amok.server(9966, 'localhost'));

  runner.run(function (error, client, runner) {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    test.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: 9966,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach(function (pathname) {
      http.get({
        port: 9966,
        hostname: 'localhost',
        path: pathname
      }, function (response) {
        test.equal(response.statusCode, 200);

        response.setEncoding('utf-8');

        var body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });

        response.on('end', function () {
          test.equal(body, fs.readFileSync('test/fixture/basic/index.html', 'utf-8'));
          pathnames.splice(pathnames.indexOf(pathname), 1);
        });
      });
    });
  });
});

test('generate index.html', function (test) {
  test.plan(12);

  var runner = amok.createRunner();
  test.on('end', function () {
    runner.close();
  });

  var pathnames = ['/', '/index.html'];

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.server(9966, 'localhost'));

  runner.run(function (error, client, runner) {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    test.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: 9966,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach(function (pathname) {
      http.get({
        port: 9966,
        hostname: 'localhost',
        path: pathname
      }, function (response) {
        test.equal(response.statusCode, 200);

        response.setEncoding('utf-8');

        var body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });

        response.on('end', function () {
          test.ok(body.indexOf('<script src="a"></script>'));
          test.ok(body.indexOf('<script src="b"></script>'));
          test.ok(body.indexOf('<script src="c"></script>'));

          pathnames.splice(pathnames.indexOf(pathname), 1);
        });
      });
    });
  });
});

test('generate favicon.ico', function (test) {
  test.plan(5);

  var runner = amok.createRunner();
  test.on('end', function () {
    runner.close();
  });

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.server(9966, 'localhost'));

  runner.run(function (error, client, runner) {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    test.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: 9966,
      hostname: 'localhost',
      pathname: '/'
    }));

    http.get({
      port: 9966,
      hostname: 'localhost',
      path: '/favicon.ico'
    }, function (response) {
      test.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function (chunk) {
        body += chunk;
      });

      response.on('end', function () {
        runner.close();
      });
    });
  });
});

test('generate index.html', function (test) {
  test.plan(12);

  var runner = amok.createRunner();
  test.on('end', function () {
    runner.close();
  });

  var pathnames = ['/', '/index.html'];

  runner.set('scripts', {
    'a.js': 'test/fixture/basic/index.js',
    'b.js': 'test/fixture/basic/index.js',
    'c.js': 'test/fixture/basic/index.js',
  });

  runner.use(amok.server(9966, 'localhost'));

  runner.run(function (error, client, runner) {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    test.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: 9966,
      hostname: 'localhost',
      pathname: '/'
    }));

    pathnames.forEach(function (pathname) {
      http.get({
        port: 9966,
        hostname: 'localhost',
        path: pathname
      }, function (response) {
        test.equal(response.statusCode, 200);

        response.setEncoding('utf-8');

        var body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });

        response.on('end', function () {
          test.ok(body.indexOf('<script src="a"></script>'));
          test.ok(body.indexOf('<script src="b"></script>'));
          test.ok(body.indexOf('<script src="c"></script>'));

          pathnames.splice(pathnames.indexOf(pathname), 1);
        });
      });
    });
  });
});

test('serve scripts', function (test) {
  test.plan(12);

  var runner = amok.createRunner();
  test.on('end', function () {
    runner.close();
  });
  
  runner.set('cwd', 'test/fixture/basic');

  var scripts = {
    'index.js': 'index.html',
    'a.js': 'index.js',
    'b.js': 'index.js',
    'c.js': 'index.js',
  };

  runner.set('scripts', scripts);

  runner.use(amok.server(9966, 'localhost'));

  runner.run(function (error, client, runner) {
    test.error(error);
    test.ok(client, 'client');
    test.ok(runner, 'runner');

    test.equal(runner.get('url'), url.format({
      protocol: 'http',
      port: 9966,
      hostname: 'localhost',
      pathname: '/'
    }));

    var pathnames = Object.keys(scripts);
    pathnames.forEach(function (pathname) {
      http.get({
        port: 9966,
        hostname: 'localhost',
        path: url.resolve('/', pathname)
      }, function (response) {
        test.equal(response.statusCode, 200);

        response.setEncoding('utf-8');

        var body = '';
        response.on('data', function (chunk) {
          body += chunk;
        });

        response.on('end', function () {
          var filename = scripts[pathname];
          test.equal(body, fs.readFileSync(path.join('test/fixture/basic', filename), 'utf-8'));

          pathnames.splice(pathnames.indexOf(pathname), 1);
          if (pathnames.length < 1) {
            runner.close();
          }
        });
      });
    });
  });
});

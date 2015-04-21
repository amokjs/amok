var amok = require('../');
var fs = require('fs');
var http = require('http');
var test = require('tape');

test('serve static script', function(t) {
  var options = {
    cwd: 'test'
  };

  var server = amok.serve(8888, 'localhost');
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 8888,
      path: '/fixture/plain.js'
    }, function(response) {
      t.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function(data) {
        body += data;
      });

      response.on('end', function() {
        fs.readFile('test/fixture/plain.js', 'utf-8', function(error, contents) {
          t.error(error);
          t.equal(body, contents);

          server.close();
        });
      });
    });

    server.on('close', function() {
      t.end();
    });
  });
});

test('serve alias script', function(t) {
  var options = {
    scripts: {
      'test/fixture/plain.js': 'alias.js'
    }
  };

  var server = amok.serve(9966, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 9966,
      path: '/alias.js'
    }, function(response) {
      t.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function(data) {
        body += data;
      });

      response.on('end', function() {
        fs.readFile('test/fixture/plain.js', 'utf-8', function(error, contents) {
          t.error(error);
          t.equal(body, contents);

          server.close();
        });
      });
    });

    server.on('close', function() {
      t.end();
    });
  });
});

test('serve file index', function(t) {
  var options = {
    cwd: 'test/fixture',
    scripts: {
      'main.js': 'entry.js',
      'lib.js': 'library.js'
    }
  };

  var server = amok.serve(9966, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 9966,
      path: '/index.html'
    }, function(response) {
      t.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function(data) {
        body += data;
      });

      response.on('end', function() {
        t.notEqual(body.indexOf('<script src="plain.js">'), -1);
        server.close();
      });
    });

    server.on('close', function() {
      t.end();
    });
  });
});


test('serve generated index', function(t) {
  var options = {
    scripts: {
      'main.js': 'entry.js',
      'lib.js': 'library.js'
    }
  };

  var server = amok.serve(9966, 'localhost', options);
  server.on('listening', function() {
    http.get({
      host: 'localhost',
      port: 9966,
      path: '/index.html'
    }, function(response) {
      t.equal(response.statusCode, 200);

      var body = '';
      response.on('data', function(data) {
        body += data;
      });

      response.on('end', function() {
        t.notEqual(body.indexOf('<script src="entry.js">'), -1);
        t.notEqual(body.indexOf('<script src="library.js">'), -1);

        server.close();
      });
    });

    server.on('close', function() {
      t.end();
    });
  });
});

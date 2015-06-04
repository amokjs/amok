const fs = require('fs');
const http = require('http');
const mime = require('mime');
const path = require('path');
const url = require('url');
const util = require('util');

const debug = util.debuglog('amok-server');

function plugin(port, host) {
  return function server(inspector, runner, done) {
    var server = http.createServer();

    server.once('error', function(error) {
      done(error);
    });

    server.once('listening', function ready() {
      runner.set('url', url.format({
        protocol: 'http',
        port: port,
        hostname: host,
        pathname: '/'
      }));

      debug('ready');
      done();
    });

    runner.once('close', function close() {
      debug('close');
      server.close();
    });

    server.on('request', function handle(request, response) {
      debug('handle %s', request.url);

      var pathname = url.parse(request.url).pathname;
      if (pathname === '/') {
        pathname = '/index.html';
      }

      var scripts = runner.get('scripts');
      var filename = scripts[path.normalize(pathname.slice(1))] || path.normalize(pathname.slice(1));

      if (!path.isAbsolute(filename)) {
        filename = path.join(runner.get('cwd'), filename);
      }

      fs.stat(filename, function(error, stat) {
        response.setHeader('content-type', mime.lookup(filename));

        if (error) {
          if (pathname === '/index.html') {
            debug('generate index.html');

            response.write('<!DOCTYPE html><html><head>');
            response.write('<title>' + path.basename(runner.get('cwd')) + '</title>');
            response.write('</head><body>');

            if (scripts) {
              Object.keys(scripts).forEach(function(src) {
                response.write('<script src="' + src +'"></script>');
              });
            }

            return response.end('</body></html>');
          } else if (pathname === '/favicon.ico') {
            debug('generate favicon.ico');
            return response.end();
          } else {
            debug('404 %s', pathname);
            response.statusCode = 404;
            return response.end('404');
          }
        }

        if (stat.isFile()) {
          debug('stream %s', filename);
          fs.createReadStream(filename).pipe(response);
        } else {
          debug('403 %s', pathname);
          response.statusCode = 403;
          return response.end('403');
        }
      });
    });

    server.listen(port, host);
  };
}

module.exports = plugin;

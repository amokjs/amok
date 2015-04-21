var fs = require('fs');
var http = require('http');
var mime = require('mime');
var url = require('url');
var path = require('path');

function serve(port, host, options) {
  var options = options || {};
  var cwd = options.cwd || process.cwd();
  var scripts = options.scripts || {};

  var server = http.createServer();
  server.on('request', function(request, response) {
    if (request.url === '/') {
      request.url = '/index.html';
    }

    var location = url.parse(request.url);
    var filename = path.join(cwd, location.pathname);

    for (var name in scripts) {
      if (scripts.hasOwnProperty(name)) {
        if (scripts[name] === path.relative('/', location.pathname)) {
          filename = name;
          break;
        }
      }
    }

    fs.exists(filename, function(exists) {
      if (exists) {
        response.setHeader('content-type', mime.lookup(filename));
        response.writeHead(200);

        var file = fs.createReadStream(filename);
        file.pipe(response);
      } else if (path.basename(filename) === 'index.html') {
        response.setHeader('content-type', 'text/html');
        response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

        for (var name in scripts) {
          if (scripts.hasOwnProperty(name)) {
            response.write('<script src="' + scripts[name] + '"></script>');
          }
        }

        response.end('</body>');
      } else {
        response.writeHead(404);
        response.end('404');
      }
    });
  });

  server.listen(port, host);
  return server;
}

module.exports = serve;

var child = require('child_process'),
    chokidar = require('chokidar'),
    fs = require('fs'),
    http = require('http'),
    mime = require('mime'),
    path = require('path'),
    rdbg = require('rdbg'),
    util = require('util');


function serve(options, callback) {
  var server = http.createServer(function(request, response) {
    if (request.url == '/') {
      response.setHeader('content-type', 'text/html');
      response.write('<!doctype html><head><meta charset="utf-8"></head><body>');

      for (var key in options.scripts) {
        response.write('<script src="' + key + '"></script>');
      }

      response.end('</body>');
    } else {
      var filename = options.scripts[path.basename(request.url)];
      if (!filename) {
        var filename = path.join(options.cwd, request.url);
      }

      fs.exists(filename, function(exists) {
        if (exists) {
          response.setHeader('content-type', mime.lookup(filename));
          response.writeHead(200);

          var file = fs.createReadStream(filename);
          file.pipe(response);
        } else {
          response.writeHead(404);
          response.end('404');
        }
      });
    }
  });

  server.listen(options.port, options.host, callback);
  return server;
}


function compile(options, callback) {
  var args = options.compiler.match(/\S+|"[^"]+"/g);
  var cmd = args.shift();

  args = args.concat(options.args);

  if (args.indexOf('$@') > -1) {
    args[args.indexOf('$@')] = options.output;
  }

  var compiler = child.spawn(cmd, args);
  process.nextTick(function() {
    callback(null, compiler.stdout, compiler.stderr);
  });

  return compiler;
}


function watch(options, callback) {
  var files = Object.keys(options.scripts).map(function(key) {
    return path.dirname(options.scripts[key]);
  });

  var watcher = chokidar.watch(files, {
    persistent: true
  });

  if (callback) {
    watcher.once('ready', callback);
  }

  return watcher;
}


function debug(options, callback) {
  var bugger = rdbg.connect(options.debuggerPort, options.debuggerHost, function(target) {
    callback(null, target);
  });

  bugger.targets(function(targets) {
    var target = targets.filter(function(target) {
      return target.url.indexOf(options.host) > -1 && target.webSocketDebuggerUrl;
    })[0];

    bugger.attach(target);
  });

  return bugger;
}


function open(options, callback) {
  var args = options.client.match(/\S+|"[^"]+"/g);
  var cmd = args.shift();

  var url = util.format('http://%s:%d', options.host, options.port);
  args.push(url);

  var client = child.spawn(cmd, args);

  process.nextTick(function() {
    callback(null, client.stdout, client.stderr);
  });

  return client;
}


module.exports.serve = serve;
module.exports.watch = watch;
module.exports.compile = compile;
module.exports.debug = debug;
module.exports.open = open;

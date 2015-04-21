var child = require('child_process');
var temp = require('temp');
var which = require('which');
var fs = require('fs');

var clients = {
  chrome: function chrome(options) {
    var command = (function() {
      switch (process.platform) {
      case 'win32':
        var suffix = '\\Google\\Chrome\\Application\\chrome.exe';
        var prefixes = [
          process.env['LOCALAPPDATA'],
          process.env['PROGRAMFILES'],
          process.env['PROGRAMFILES(X86)']
        ];

        var executables = prefixes.map(function(prefix) {
          return prefix + suffix;
        }).filter(function(path) {
          return fs.existsSync(path);
        });

        return executables[0];

      case 'darwin':
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

      default:
        return which.sync('google-chrome');
      }
    }());

    var args = [
      '--remote-debugging-port=' + options.debuggerPort,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-translate',
      '--disable-default-apps',
      '--disable-popup-blocking',
      '--disable-zero-browsers-open-for-tests',
      '--user-data-dir=' + temp.mkdirSync('amok-chrome')
    ];

    args.push(options.url);

    return { command: command, args: args };
  }
};

function open(options, callback) {
  var client = null;
  if (clients[options.client]) {
    client = clients[options.client].call(null, options);
  } else {
    var args = options.match(/'[^"]*'|"[^"]*"|\S+/g);
    var command = args.shift();

    args.push(options.url);

    client = {
      args: args,
      command: command
    };
  }

  var exe = child.spawn(client.command, client.args);
  setTimeout(function() {
    callback(null, exe);
  }, 1000);

  return exe;
}

module.exports = open;

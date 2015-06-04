#!/usr/bin/env node

const amok = require('..');
const program = require('commander');

program.version(require('../package.json').version);

program.usage('[OPTION ...] <URL | FILE>');
program.option('-s, --debug-host <HOST>', 'specify debug host', 'localhost');
program.option('-r, --debug-port <PORT>', 'specify debug port', 9222);

program.option('-b, --browser <BROWSER>', 'specify browser', function(value) {
  var args = process.env[value.toUpperCase() + '_FLAGS'];
  if (args) {
    args = args.split(' ');
  }

  var command = process.env[value.toUpperCase() + '_BIN'];
  if (!command) {
    command = value;
  }

  return {
    command: command,
    args: args
  };
});

program.option('-a, --host <HOST>', 'specify http host', 'localhost');
program.option('-p, --port <PORT>', 'specify http port', 9966);
program.option('-c, --compiler <COMPILER>', 'specify compiler');

program.option('-w, --watch <GLOB>', 'specify watch pattern');
program.option('-t, --hot [GLOB]', 'enable script hot patching');
program.option('-i, --interactive', 'enable interactive mode');
program.option('-d, --cwd <DIR>', 'change working directory', process.cwd());

program.parse(process.argv);

amok.set('cwd', program.cwd);

program.url = program.args.filter(function(arg) {
  return arg.match(/^(http|https|file|about:blank)/);
})[0];

program.scripts = program.args.filter(function(arg) {
  return arg.match(/(.js|.ts|.coffee)$/);
});

if (program.url) {
  amok.set('url', program.url);
} else if (program.scripts.length > 0) {
  amok.set('scripts', program.scripts.reduce(function(object, value, key) {
    object[value] = value;
    return object;
  }, {}));

  amok.use(amok.server(program.port, program.host));
} else {
  program.help();
}

if (program.compiler) {
  amok.use(amok.compiler(program.compiler, program.args, process.stderr));
}

if (program.watch) {
  amok.use(amok.watch(program.watch));
}

if (program.hot) {
  amok.use(amok.hotpatch(program.hot));
}

if (program.browser) {
  amok.use(amok.browser(program.browser.command, program.browser.args, process.stderr));
}

if (program.interactive) {
  amok.use(amok.repl(process.stdin, process.stdout));
} else {
  amok.use(amok.print(process.stdout));
}

amok.connect(program.debugPort, program.debugHost, function(error) {
  if (error) {
    process.stdout.write(error);
    process.exit(1);
  }
});

process.on('SIGTERM', function() {
  process.exit(0);
});

process.on('SIGINT', function() {
  process.exit(0);
});

process.on('exit', function() {
  amok.close();
});

function plugin(output) {
  return function print(inspector, runner, done) {
    inspector.console.on('data', function(message) {
      output.write(message.text + '\n');
    });

    done();
  };
}

module.exports = plugin;

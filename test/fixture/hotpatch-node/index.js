process.on('scriptChange',function() {
  console.log('step-0');
});

setTimeout(function() {
  // FIXME remove this timeout, there's an issue with bugger currently
  // where it doesn't buffer console messages
  console.log('ready');
}, 2000);
